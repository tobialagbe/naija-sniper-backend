import { IsNotEmpty, IsString } from 'class-validator';

export class CheckRegistrationDto {
  @IsNotEmpty()
  @IsString()
  readonly tournamentId: string;

  @IsNotEmpty()
  @IsString()
  readonly userId: string;
} 