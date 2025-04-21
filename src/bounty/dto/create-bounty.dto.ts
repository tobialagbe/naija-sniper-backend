import { IsBoolean, IsDate, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBountyDto {
  @IsOptional()
  @IsString()
  readonly imageUrl?: string;

  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @IsOptional()
  @IsString()
  readonly description?: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  readonly amount: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  readonly numberOfWinners: number;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  readonly startDate: Date;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  readonly endDate: Date;

  @IsOptional()
  @IsNumber()
  @Min(0)
  readonly killCount?: number;

  @IsOptional()
  @IsBoolean()
  readonly active?: boolean;
} 