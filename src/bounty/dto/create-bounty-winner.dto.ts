import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateBountyWinnerDto {
  @IsNotEmpty()
  @IsString()
  readonly bountyId: string;

  @IsNotEmpty()
  @IsString()
  readonly userId: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  readonly killCount?: number;
} 