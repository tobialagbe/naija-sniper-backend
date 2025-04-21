# Paystack Payment Integration

This module provides integration with Paystack payment gateway, allowing you to:
1. Initialize transactions
2. Verify transaction status
3. Handle Paystack webhooks with signature verification

## Setup

1. Add your Paystack secret key to your environment variables:
```
PAYSTACK_SECRET_KEY=your_secret_key_here
```

2. Import the PaystackModule in your application:
```typescript
import { PaystackModule } from './paystack/paystack.module';

@Module({
  imports: [
    // ... other modules
    PaystackModule,
  ],
})
export class AppModule {}
```

## Available Endpoints

### Initialize Transaction

```
POST /payments/initialize
```

**Request Body:**
```json
{
  "email": "customer@example.com",
  "amount": 10.00, // Amount in your main currency unit (will be converted to subunits)
  "callback_url": "https://yourwebsite.com/payment-callback",
  "reference": "optional-unique-reference", // Optional
  "metadata": { // Optional
    "custom_field": "custom value"
  }
}
```

**Response:**
```json
{
  "status": true,
  "message": "Authorization URL created",
  "data": {
    "authorization_url": "https://checkout.paystack.com/abc123xyz",
    "access_code": "abc123xyz",
    "reference": "transaction-reference"
  }
}
```

### Verify Transaction

```
GET /payments/verify/:reference
```

**Response:**
```json
{
  "status": true,
  "message": "Verification successful",
  "data": {
    "id": 123456789,
    "status": "success",
    "reference": "transaction-reference",
    "amount": 1000, // Amount in kobo/cents
    "customer": {
      "email": "customer@example.com",
      // Other customer details
    },
    // Other transaction details
  }
}
```

### Webhook Endpoint

```
POST /payments/webhook
```

This endpoint handles Paystack event notifications. The module verifies the signature from the `x-paystack-signature` header to ensure the webhook is authentic. The webhook handler:

1. Verifies the signature using HMAC SHA-512
2. Processes different event types (e.g., charge.success, transfer.success)
3. Returns a 200 status code immediately as required by Paystack

To set up webhooks:
1. Log in to your Paystack dashboard
2. Go to Settings > API Keys & Webhooks
3. Add your webhook URL (e.g., `https://your-domain.com/api/payments/webhook`)
4. Save the webhook URL

## Using in Your Code

You can inject and use the PaystackService in your own services:

```typescript
import { Injectable } from '@nestjs/common';
import { PaystackService } from '../paystack/paystack.service';
import { InitializeTransactionDto } from '../paystack/dto/initialize-transaction.dto';

@Injectable()
export class YourService {
  constructor(private readonly paystackService: PaystackService) {}

  async processPayment(email: string, amount: number) {
    const transactionDto: InitializeTransactionDto = {
      email,
      amount,
      callback_url: 'https://yourwebsite.com/payment-callback'
    };

    // Initialize transaction
    const initResult = await this.paystackService.initializeTransaction(transactionDto);
    
    return initResult.data.authorization_url;
  }

  async verifyPayment(reference: string) {
    const verifyResult = await this.paystackService.verifyTransaction(reference);
    
    if (verifyResult.data.status === 'success') {
      // Payment successful, deliver value to customer
      return true;
    }
    
    return false;
  }
}
```

## Frontend Integration

To use Paystack in your frontend:

1. Initialize the transaction from your backend
2. Redirect user to the `authorization_url` or use the Paystack Popup library
3. After payment, user will be redirected to your callback URL
4. Verify the transaction status on your backend

## Important Notes

1. **Security**: Never expose your secret key on the frontend
2. **Amount**: Always verify the amount matches what you expect before delivering value
3. **Webhook**: Setup a webhook URL in your Paystack dashboard to receive real-time payment notifications
4. **Signature Verification**: The webhook endpoint verifies signatures to ensure requests are authentic 