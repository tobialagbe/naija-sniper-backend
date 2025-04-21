import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Bounty } from './bounty.entity';

export type BountyWinnerDocument = BountyWinner & Document;

@Schema({ timestamps: true })
export class BountyWinner {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Bounty', required: true })
  bountyId: Bounty;

  @Prop({ required: true })
  bountyName: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: string;

  @Prop({ required: true })
  username: string;

  @Prop({ default: 0 })
  killCount: number;
}

export const BountyWinnerSchema = SchemaFactory.createForClass(BountyWinner); 