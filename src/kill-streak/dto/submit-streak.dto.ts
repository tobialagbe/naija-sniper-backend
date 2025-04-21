import { IsNotEmpty, IsString, IsNumber, IsObject, IsOptional, Min, IsUrl } from 'class-validator';

export class SubmitStreakDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  challengeId: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  killStreak: number;

  @IsOptional()
  @IsObject()
  gameMetadata?: Record<string, any>;

  @IsOptional()
  @IsUrl()
  submissionEvidence?: string;
} 