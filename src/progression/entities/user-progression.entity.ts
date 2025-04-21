import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { MilitaryRank } from '../enums/ranks.enum';

export type UserProgressionDocument = Document & UserProgression;

@Schema({ timestamps: true })
export class UserProgression {
  @Prop({ required: true, unique: true, type: MongooseSchema.Types.ObjectId, ref: 'User' })
  userId: string;

  @Prop({ default: 0 })
  lifetimeScore: number;

  @Prop({ default: 0 })
  lifetimeKills: number;

  @Prop({ default: 0 })
  matchesPlayed: number;

  @Prop({ default: 0 })
  wins: number;

  @Prop({ default: 0 })
  losses: number;

  @Prop({ enum: MilitaryRank, default: MilitaryRank.SECOND_LIEUTENANT })
  rank: MilitaryRank;

  @Prop({ default: 0 })
  highestScore: number;

  @Prop({ default: 0 })
  highestKills: number;

  @Prop({ type: Date })
  lastMatchDate: Date;
}

export const UserProgressionSchema = SchemaFactory.createForClass(UserProgression); 