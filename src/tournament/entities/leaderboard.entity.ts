import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Tournament } from './tournament.entity';

export type LeaderboardDocument = Leaderboard & Document;

@Schema({ timestamps: true })
export class Leaderboard {
  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Tournament', required: true })
  tournamentId: Tournament;

  @Prop({ required: true })
  tournamentName: string;

  @Prop({ required: true })
  score: number;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: string;
}

export const LeaderboardSchema = SchemaFactory.createForClass(Leaderboard); 