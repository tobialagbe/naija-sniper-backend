import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @IsString()
  readonly usernameOrEmail: string;

  @IsNotEmpty()
  @IsString()
  readonly password: string;
} 