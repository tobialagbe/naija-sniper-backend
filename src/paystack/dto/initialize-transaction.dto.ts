import { IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentReason } from '../entities/payment.entity';

export class InitializeTransactionDto {
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  readonly amount: number;

  @IsOptional()
  @IsString()
  readonly reference?: string;

  @IsOptional()
  @IsString()
  readonly callback_url?: string;

  @IsOptional()
  readonly metadata?: any;

  @IsNotEmpty()
  @IsEnum(PaymentReason)
  readonly paymentReason: PaymentReason;

  @IsNotEmpty()
  @IsString()
  readonly reasonId: string;

  @IsNotEmpty()
  @IsString()
  readonly userId: string;
} 