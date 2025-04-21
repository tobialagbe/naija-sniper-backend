import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class RecordScoreDto {
  @IsNotEmpty()
  @IsString()
  readonly tournamentId: string;

  @IsNotEmpty()
  @IsString()
  readonly userId: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  readonly score: number;
} 