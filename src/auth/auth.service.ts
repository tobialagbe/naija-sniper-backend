import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { ProgressionService } from '../progression/progression.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly progressionService: ProgressionService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const user = await this.userService.create(createUserDto);
    return this.generateToken(user);
  }

  async login(loginDto: LoginDto) {
    const { usernameOrEmail, password } = loginDto;

    // Check if user exists by username or email
    let user;
    try {
      // First try to find by email
      if (usernameOrEmail.includes('@')) {
        user = await this.userService.findByEmail(usernameOrEmail);
      } else {
        // Then try to find by username
        user = await this.userService.findByUsername(usernameOrEmail);
      }
    } catch (error) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Validate password
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateToken(user);
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;
    const resetToken = await this.userService.createPasswordResetToken(email);

    // Here you would typically send an email with the reset token
    // For simplicity, we'll just return the token
    return {
      message: 'Password reset token has been sent to your email',
      resetToken,
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, password } = resetPasswordDto;
    await this.userService.resetPassword(token, password);
    return { message: 'Password has been reset successfully' };
  }

  private async generateToken(user: any) {
    const payload = {
      sub: user._id,
      username: user.username,
      email: user.email,
    };

    // Get user's rank
    const rank = await this.progressionService.getUserRank(user._id.toString());

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        ...user.toJSON(),
        rank
      },
    };
  }
}
