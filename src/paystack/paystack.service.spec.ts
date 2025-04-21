import { Test, TestingModule } from '@nestjs/testing';
import { PaystackService } from './paystack.service';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { InitializeTransactionDto } from './dto/initialize-transaction.dto';

describe('PaystackService', () => {
  let service: PaystackService;
  let httpService: HttpService;
  
  const mockHttpService = {
    post: jest.fn(),
    get: jest.fn(),
  };
  
  const mockConfigService = {
    get: jest.fn().mockReturnValue('mock_secret_key'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaystackService,
        { provide: HttpService, useValue: mockHttpService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<PaystackService>(PaystackService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('initializeTransaction', () => {
    it('should initialize a transaction successfully', async () => {
      const initDto: InitializeTransactionDto = {
        email: 'test@example.com',
        amount: 1000,
        callback_url: 'https://example.com/callback'
      };
      
      const mockResponse = {
        status: true,
        message: 'Authorization URL created',
        data: {
          authorization_url: 'https://checkout.paystack.com/mock-url',
          access_code: 'mock-access-code',
          reference: 'mock-reference'
        }
      };
      
      mockHttpService.post.mockReturnValueOnce(
        of({
          data: mockResponse,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: { headers: {} },
        })
      );

      const result = await service.initializeTransaction(initDto);
      
      expect(httpService.post).toHaveBeenCalledWith(
        'https://api.paystack.co/transaction/initialize',
        expect.objectContaining({
          email: initDto.email,
          amount: expect.any(Number),
          callback_url: initDto.callback_url,
        }),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer mock_secret_key',
          }),
        })
      );
      
      expect(result).toEqual(mockResponse);
    });
  });

  describe('verifyTransaction', () => {
    it('should verify a transaction successfully', async () => {
      const reference = 'test-reference';
      
      const mockResponse = {
        status: true,
        message: 'Verification successful',
        data: {
          id: 12345,
          status: 'success',
          reference,
          amount: 1000,
          customer: {
            email: 'test@example.com'
          }
        }
      };
      
      mockHttpService.get.mockReturnValueOnce(
        of({
          data: mockResponse,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: { headers: {} },
        })
      );

      const result = await service.verifyTransaction(reference);
      
      expect(httpService.get).toHaveBeenCalledWith(
        `https://api.paystack.co/transaction/verify/${reference}`,
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer mock_secret_key',
          }),
        })
      );
      
      expect(result).toEqual(mockResponse);
    });
  });
}); 