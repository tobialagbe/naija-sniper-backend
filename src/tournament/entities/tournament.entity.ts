import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TournamentDocument = Tournament & Document;

@Schema({ timestamps: true })
export class Tournament {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ required: true })
  winnerPrizeMoney: number;

  @Prop({ required: true })
  totalPrizeMoney: number;

  @Prop()
  description: string;

  @Prop({ default: true })
  active: boolean;
}

export const TournamentSchema = SchemaFactory.createForClass(Tournament); 