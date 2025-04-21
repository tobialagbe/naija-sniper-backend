import { IsNotEmpty, IsString, IsBoolean, IsOptional } from 'class-validator';
import { SubmissionStatus } from '../entities/streak-submission.entity';

export class VerifySubmissionDto {
  @IsNotEmpty()
  @IsString()
  submissionId: string;

  @IsNotEmpty()
  @IsBoolean()
  isVerified: boolean;

  @IsNotEmpty()
  @IsString()
  status: SubmissionStatus;

  @IsOptional()
  @IsString()
  rejectionReason?: string;
} 