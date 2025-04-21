import { IsBoolean, IsDate, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTournamentDto {
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  readonly startDate: Date;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  readonly endDate: Date;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  readonly winnerPrizeMoney: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  readonly totalPrizeMoney: number;

  @IsOptional()
  @IsString()
  readonly description?: string;

  @IsOptional()
  @IsBoolean()
  readonly active?: boolean;
} 