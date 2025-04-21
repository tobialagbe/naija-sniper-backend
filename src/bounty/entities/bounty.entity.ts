import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BountyDocument = Bounty & Document;

@Schema({ timestamps: true })
export class Bounty {
  @Prop()
  imageUrl?: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  numberOfWinners: number;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ default: 0 })
  killCount: number;

  @Prop({ default: true })
  active: boolean;
}

export const BountySchema = SchemaFactory.createForClass(Bounty); 