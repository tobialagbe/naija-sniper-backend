import { PartialType } from '@nestjs/mapped-types';
import { CreateUserPerkDto } from './create-user-perk.dto';
import { IsBoolean, IsDate, IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateUserPerkDto extends PartialType(CreateUserPerkDto) {
  @IsOptional()
  @IsNumber()
  @Min(0)
  readonly count?: number;

  @IsOptional()
  @IsBoolean()
  readonly used?: boolean;

  @IsOptional()
  @IsDate()
  readonly usedAt?: Date;
} 