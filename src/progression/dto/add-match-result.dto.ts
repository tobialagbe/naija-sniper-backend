import { IsNotEmpty, IsNumber, IsString, IsBoolean, Min, IsOptional } from 'class-validator';

export class AddMatchResultDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  score: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  kills: number;

  @IsOptional()
  @IsBoolean()
  isWin?: boolean;
} 