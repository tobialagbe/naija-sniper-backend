import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TimedChallengeDocument = TimedChallenge & Document;

@Schema({ timestamps: true })
export class TimedChallenge {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  startDateTime: Date;

  @Prop({ required: true })
  endDateTime: Date;

  @Prop({ required: true, default: 0 })
  requiredKillStreak: number;

  @Prop({ required: true, default: 0 })
  prizePool: number;

  @Prop({ required: true, default: 0 })
  maxWinners: number;

  @Prop({ required: true, default: 0 })
  currentParticipants: number;

  @Prop({ required: true, default: 0 })
  completedParticipants: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  cancelledAt?: Date;

  @Prop()
  cancelReason?: string;
}

export const TimedChallengeSchema = SchemaFactory.createForClass(TimedChallenge); 