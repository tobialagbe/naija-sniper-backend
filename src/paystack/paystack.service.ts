import { Injectable, HttpException, NotFoundException, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { firstValueFrom } from 'rxjs';
import { createHmac } from 'crypto';
import { 
  InitializeTransactionDto, 
  PaystackBaseResponse,
  InitializeTransactionResponse,
  VerifyTransactionResponse
} from './interfaces/paystack.interfaces';
import { Payment, PaymentDocument, PaymentReason, PaymentStatus } from './entities/payment.entity';
import { TournamentService } from '../tournament/tournament.service';
import { UserService } from '../user/user.service';
import { PerksService } from '../perks/perks.service';
import { CreateUserPerkDto } from '../perks/dto/create-user-perk.dto';

@Injectable()
export class PaystackService {
  private readonly baseUrl: string;
  private readonly secretKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    private readonly tournamentService: TournamentService,
    private readonly userService: UserService,
    private readonly perksService: PerksService,
  ) {
    this.baseUrl = 'https://api.paystack.co';
    this.secretKey = this.configService.get<string>('PAYSTACK_SECRET_KEY');
    
    if (!this.secretKey) {
      console.warn('PAYSTACK_SECRET_KEY not found in environment variables. Paystack integration may not work correctly.');
    }
  }

  private getRequestHeaders() {
    return {
      Authorization: `Bearer ${this.secretKey}`,
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
    };
  }

  /**
   * Initialize a new transaction
   * @param initializeTransactionDto - Data for initializing transaction
   * @returns Promise containing transaction initialization data
   */
  async initializeTransaction(
    initializeTransactionDto: InitializeTransactionDto,
  ): Promise<PaystackBaseResponse<InitializeTransactionResponse>> {
    try {
      // Verify that user exists
      let user = await this.userService.findOne(initializeTransactionDto.userId);
      if (!user) {
        throw new NotFoundException(`User with ID ${initializeTransactionDto.userId} not found`);
      }
      
      // Check payment reason and reason ID
      await this.validatePaymentReason(
        initializeTransactionDto.paymentReason, 
        initializeTransactionDto.reasonId
      );
      
      // Convert amount to lowest currency unit (kobo/cents)
      // Paystack expects amount in the subunit of the supported currency
      const amount = Math.round(initializeTransactionDto.amount * 100);
      
      // Generate a reference if one isn't provided
      const reference = initializeTransactionDto.reference || `pay_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
      
      // Make the API call to Paystack
      const { data } = await firstValueFrom(
        this.httpService.post<PaystackBaseResponse<InitializeTransactionResponse>>(
          `${this.baseUrl}/transaction/initialize`,
          { 
            ...initializeTransactionDto, 
            email: user.email,
            amount,
            reference 
          },
          { headers: this.getRequestHeaders() }
        )
      );
      
      if (data.status) {
        // Save the transaction to our database
        await this.savePayment({
          reference: data.data.reference,
          amount: initializeTransactionDto.amount,
          email: user.email,
          paymentReason: initializeTransactionDto.paymentReason,
          reasonId: initializeTransactionDto.reasonId,
          userId: initializeTransactionDto.userId,
          authorizationUrl: data.data.authorization_url,
          accessCode: data.data.access_code,
          status: PaymentStatus.PENDING,
          paystackResponse: data,
          metadata: initializeTransactionDto.metadata,
        });
      }

      return data;
    } catch (error) {
      console.error('Paystack Initialize Transaction Error:', error.response?.data || error.message);
      throw new HttpException(
        error.response?.data?.message || 'Failed to initialize transaction',
        error.response?.status || 500,
      );
    }
  }

  /**
   * Verify a transaction's status
   * @param reference - The transaction reference to verify
   * @returns Promise containing transaction verification data
   */
  async verifyTransaction(
    reference: string,
  ): Promise<PaystackBaseResponse<VerifyTransactionResponse>> {
    try {
      // Check if the reference exists in our database
      const existingPayment = await this.paymentModel.findOne({ reference }).exec();
      if (!existingPayment) {
        throw new NotFoundException(`Transaction with reference ${reference} not found`);
      }
      
      const { data } = await firstValueFrom(
        this.httpService.get<PaystackBaseResponse<VerifyTransactionResponse>>(
          `${this.baseUrl}/transaction/verify/${reference}`,
          { headers: this.getRequestHeaders() }
        )
      );

      // Update our payment record
      if (data.status) {
        const status = data.data.status === 'success' 
          ? PaymentStatus.SUCCESSFUL 
          : PaymentStatus.FAILED;
          
        await this.updatePaymentStatus(reference, status, data, 'verify');
        
        // If payment is successful, process the payment reason
        if (status === PaymentStatus.SUCCESSFUL) {
          await this.processSuccessfulPayment(existingPayment);
        }
      }

      return data;
    } catch (error) {
      console.error('Paystack Verify Transaction Error:', error.response?.data || error.message);
      throw new HttpException(
        error.response?.data?.message || 'Failed to verify transaction',
        error.response?.status || 500,
      );
    }
  }

  /**
   * Verify the signature of a Paystack webhook
   * @param signature - The signature from the X-Paystack-Signature header
   * @param payload - The raw request body as a string
   * @returns boolean indicating if the signature is valid
   */
  verifyWebhookSignature(signature: string, payload: string): boolean {
    try {
      const hash = createHmac('sha512', this.secretKey)
        .update(payload)
        .digest('hex');
      
      return hash === signature;
    } catch (error) {
      console.error('Error verifying webhook signature:', error);
      return false;
    }
  }
  
  /**
   * Process a webhook event from Paystack
   * @param event - The event type
   * @param data - The event data
   */
  async processWebhookEvent(event: string, data: any): Promise<void> {
    try {
      console.log(`Processing Paystack webhook: ${event}`);
      
      if (!data || !data.reference) {
        console.warn('Webhook data is missing reference');
        return;
      }
      
      // Find the payment in our database
      const payment = await this.paymentModel.findOne({ reference: data.reference }).exec();
      if (!payment) {
        console.warn(`Payment with reference ${data.reference} not found`);
        return;
      }
      
      // Update based on the event type
      switch (event) {
        case 'charge.success':
          await this.updatePaymentStatus(
            data.reference, 
            PaymentStatus.SUCCESSFUL, 
            data, 
            event
          );
          await this.processSuccessfulPayment(payment);
          break;
          
        case 'charge.failed':
          await this.updatePaymentStatus(
            data.reference, 
            PaymentStatus.FAILED, 
            data, 
            event
          );
          break;
          
        default:
          console.log(`Unhandled webhook event type: ${event}`);
      }
    } catch (error) {
      console.error('Error processing webhook event:', error);
    }
  }
  
  /**
   * Save a new payment to the database
   * @param paymentData - The payment data to save
   */
  private async savePayment(paymentData: Partial<Payment>): Promise<Payment> {
    try {
      const payment = new this.paymentModel(paymentData);
      return payment.save();
    } catch (error) {
      console.error('Error saving payment:', error);
      throw new HttpException('Failed to save payment', 500);
    }
  }
  
  /**
   * Update payment status in the database
   * @param reference - The payment reference
   * @param status - The new payment status
   * @param paystackResponse - The response from Paystack
   * @param event - The event that triggered this update
   */
  private async updatePaymentStatus(
    reference: string, 
    status: PaymentStatus, 
    paystackResponse: any, 
    event: string
  ): Promise<Payment> {
    try {
      const payment = await this.paymentModel.findOne({ reference }).exec();
      if (!payment) {
        throw new NotFoundException(`Payment with reference ${reference} not found`);
      }
      
      payment.status = status;
      payment.paystackResponse = paystackResponse;
      payment.paystackEvent = event;
      
      if (status === PaymentStatus.SUCCESSFUL) {
        payment.verifiedAt = new Date();
      }
      
      if (event.startsWith('webhook')) {
        payment.webhookProcessedAt = new Date();
      }
      
      return payment.save();
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw new HttpException('Failed to update payment status', 500);
    }
  }
  
  /**
   * Validate the payment reason and reasonId
   * @param reason - The payment reason (tournament or perk)
   * @param reasonId - The ID related to the reason
   */
  private async validatePaymentReason(reason: PaymentReason, reasonId: string): Promise<void> {
    try {
      switch (reason) {
        case PaymentReason.TOURNAMENT:
          // Check if tournament exists
          await this.tournamentService.findOne(reasonId);
          break;
          
        case PaymentReason.PERK:
          // Validate perk key exists
          await this.perksService.getPerkByKey(reasonId);
          break;
          
        default:
          throw new BadRequestException(`Invalid payment reason: ${reason}`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error validating payment reason:', error);
      throw new BadRequestException('Invalid payment reason or reasonId');
    }
  }
  
  /**
   * Process a successful payment based on its reason
   * @param payment - The payment that was successful
   */
  private async processSuccessfulPayment(payment: Payment): Promise<void> {
    try {
      switch (payment.paymentReason) {
        case PaymentReason.TOURNAMENT:
          // Register the user for the tournament
          await this.tournamentService.registerForTournament({
            tournamentId: payment.reasonId,
            userId: payment.userId,
          });
          break;
          
        case PaymentReason.PERK:
          // Get the perk details to access the defaultCount
          const perk = await this.perksService.getPerkByKey(payment.reasonId);
          
          // Add the purchased perk to the user's perks
          const createUserPerkDto: CreateUserPerkDto = {
            userId: payment.userId,
            perkKey: payment.reasonId,
            // Priority: 1. metadata count if specified, 2. perk's defaultCount
            count: payment.metadata?.count 
              ? Number(payment.metadata.count) 
              : perk.defaultCount
          };
          
          await this.perksService.createUserPerk(createUserPerkDto);
          break;
          
        default:
          console.warn(`Unknown payment reason: ${payment.paymentReason}`);
      }
    } catch (error) {
      console.error('Error processing successful payment:', error);
      // We don't throw here to avoid breaking the webhook flow
      // Instead, log it for manual intervention
    }
  }
  
  /**
   * Get payment details by reference
   * @param reference - The payment reference
   */
  async getPaymentByReference(reference: string): Promise<Payment> {
    const payment = await this.paymentModel.findOne({ reference }).exec();
    if (!payment) {
      throw new NotFoundException(`Payment with reference ${reference} not found`);
    }
    return payment;
  }
  
  /**
   * Get all payments by user ID
   * @param userId - The user ID
   */
  async getPaymentsByUser(userId: string): Promise<Payment[]> {
    return this.paymentModel.find({ userId }).sort({ createdAt: -1 }).exec();
  }
} 