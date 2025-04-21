import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Tournament } from './tournament.entity';

export type RegistrationDocument = Registration & Document;

@Schema({ timestamps: true })
export class Registration {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Tournament', required: true })
  tournamentId: Tournament;

  @Prop({ required: true })
  tournamentName: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: string;

  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ default: Date.now })
  registeredAt: Date;

  @Prop({ default: true })
  active: boolean;
}

export const RegistrationSchema = SchemaFactory.createForClass(Registration); 