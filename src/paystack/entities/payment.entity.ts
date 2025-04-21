import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type PaymentDocument = Payment & Document;

export enum PaymentStatus {
  PENDING = 'pending',
  SUCCESSFUL = 'successful',
  FAILED = 'failed'
}

export enum PaymentReason {
  TOURNAMENT = 'tournament',
  PERK = 'perk'
}

@Schema({ timestamps: true })
export class Payment {
  @Prop({ required: true, unique: true })
  reference: string;

  @Prop({
    type: String,
    enum: Object.values(PaymentStatus),
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  email: string;

  @Prop({
    type: String,
    enum: Object.values(PaymentReason),
    required: true,
  })
  paymentReason: PaymentReason;

  @Prop({ required: true })
  reasonId: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: string;

  @Prop()
  authorizationUrl: string;

  @Prop()
  accessCode: string;

  @Prop({ type: MongooseSchema.Types.Mixed })
  paystackResponse: any;

  @Prop()
  paystackEvent: string;

  @Prop({ type: MongooseSchema.Types.Mixed })
  metadata: any;

  @Prop()
  verifiedAt: Date;

  @Prop()
  webhookProcessedAt: Date;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment); 