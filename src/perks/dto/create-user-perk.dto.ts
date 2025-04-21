import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateUserPerkDto {
  @IsNotEmpty()
  @IsString()
  readonly userId: string;

  @IsNotEmpty()
  @IsString()
  readonly perkKey: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  readonly count?: number;
} 