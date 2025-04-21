import { Controller, Post, Body, Get, Param, HttpStatus, HttpException, UseGuards, Headers, Req } from '@nestjs/common';
import { PaystackService } from './paystack.service';
import { InitializeTransactionDto } from './dto/initialize-transaction.dto';
import { VerifyTransactionDto } from './dto/verify-transaction.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

// Extend the Express Request interface to include rawBody
interface RequestWithRawBody extends Request {
  rawBody: Buffer;
}

@Controller('payments')
export class PaystackController {
  constructor(private readonly paystackService: PaystackService) {}

  /**
   * Initialize a transaction
   * @param initializeTransactionDto - The transaction data
   * @returns Transaction initialization response
   */
  
//   @UseGuards(JwtAuthGuard)
  @Post('initialize')
  async initializeTransaction(@Body() initializeTransactionDto: InitializeTransactionDto) {
    try {
      return await this.paystackService.initializeTransaction(initializeTransactionDto);
    } catch (error) {
      throw new HttpException(
        error.response?.data?.message || 'Error initializing transaction',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Verify a transaction
   * @param reference - The transaction reference to verify
   * @returns Transaction verification response
   */
  @Get('verify/:reference')
  async verifyTransaction(@Param('reference') reference: string) {
    try {
      return await this.paystackService.verifyTransaction(reference);
    } catch (error) {
      throw new HttpException(
        error.response?.data?.message || 'Error verifying transaction',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Webhook endpoint for Paystack notifications
   * @param signature - The Paystack signature from headers
   * @param body - The webhook payload
   * @param request - Express request object with raw body
   * @returns Webhook acknowledgment
   */
  @Post('webhook')
  async handleWebhook(
    @Headers('x-paystack-signature') signature: string,
    @Body() body: any,
    @Req() request: RequestWithRawBody
  ) {
    // Always return a 200 response immediately to acknowledge receipt
    // Paystack expects a quick response
    
    // Verify the signature if provided
    if (signature) {
      // Get the raw body for signature verification
      const rawBody = request.rawBody;
      if (!rawBody) {
        console.warn('Raw body not available for webhook signature verification');
      } else {
        const isValid = this.paystackService.verifyWebhookSignature(
          signature,
          rawBody.toString()
        );
        
        if (!isValid) {
          console.warn('Invalid Paystack webhook signature');
          return { status: 'success' }; // Still return success to avoid retries
        }
      }
    }
    
    try {
      // Process the webhook event asynchronously to avoid delaying response
      const event = body.event;
      
      // Don't await to avoid delaying response
      this.paystackService.processWebhookEvent(event, body.data);
      
      return { status: 'success' };
    } catch (error) {
      console.error('Error handling webhook:', error);
      return { status: 'success' }; // Still return success to avoid retries
    }
  }
  
  /**
   * Get payment details by reference
   * @param reference - The payment reference
   * @returns Payment details
   */
  @UseGuards(JwtAuthGuard)
  @Get('details/:reference')
  async getPaymentDetails(@Param('reference') reference: string) {
    return this.paystackService.getPaymentByReference(reference);
  }
  
  /**
   * Get all payments for a user
   * @param userId - The user ID
   * @returns List of payments
   */
  @UseGuards(JwtAuthGuard)
  @Get('user/:userId')
  async getUserPayments(@Param('userId') userId: string) {
    return this.paystackService.getPaymentsByUser(userId);
  }
} 