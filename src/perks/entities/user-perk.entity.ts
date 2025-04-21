import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type UserPerkDocument = UserPerk & Document;

@Schema({ timestamps: true })
export class UserPerk {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: string;

  @Prop({ required: true })
  perkKey: string;

  @Prop({ required: true })
  perkName: string;

  @Prop({ required: true, default: 1 })
  count: number;

  @Prop({ default: false })
  used: boolean;

  @Prop()
  usedAt?: Date;
}

export const UserPerkSchema = SchemaFactory.createForClass(UserPerk); 