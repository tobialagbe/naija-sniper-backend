import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { TimedChallenge } from './timed-challenge.entity';

export enum SubmissionStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  WINNER = 'winner'
}

export type StreakSubmissionDocument = StreakSubmission & Document;

@Schema({ timestamps: true })
export class StreakSubmission {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: string;

  @Prop({ required: true })
  username: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'TimedChallenge', required: true })
  challengeId: string;

  @Prop({ required: true })
  killStreak: number;

  @Prop({ default: false })
  isEligible: boolean;

  @Prop({ required: true, default: SubmissionStatus.PENDING, enum: SubmissionStatus })
  status: SubmissionStatus;

  @Prop()
  verifiedAt?: Date;

  @Prop()
  rejectionReason?: string;

  @Prop({ default: false })
  hasPrizeClaimed: boolean;

  @Prop()
  prizeClaimedAt?: Date;

  @Prop()
  prizeAmount?: number;

  @Prop()
  ranking?: number;

  @Prop({ type: Object })
  gameMetadata?: Record<string, any>;

  @Prop()
  submissionEvidence?: string; // Could be a URL to a screenshot or video
}

export const StreakSubmissionSchema = SchemaFactory.createForClass(StreakSubmission); 