import { IsNotEmpty, IsString, IsNumber, IsDateString, Min, IsOptional } from 'class-validator';

export class CreateChallengeDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsDateString()
  startDateTime: string;

  @IsNotEmpty()
  @IsDateString()
  endDateTime: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  requiredKillStreak: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  prizePool: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  maxWinners: number;
  
  @IsOptional()
  @IsString()
  additionalInfo?: string;
} 