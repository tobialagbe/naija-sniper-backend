import { IsNotEmpty, IsString } from 'class-validator';

export class RegisterTournamentDto {
  @IsNotEmpty()
  @IsString()
  readonly tournamentId: string;

  @IsNotEmpty()
  @IsString()
  readonly userId: string;
} 