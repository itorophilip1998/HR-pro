import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signup(signupDto: SignupDto) {
    const user = await this.usersService.create(
      signupDto.email,
      signupDto.password,
      signupDto.name,
    );

    const { password: _, ...result } = user;
    const payload = { email: user.email, sub: user.id };

    return {
      access_token: this.jwtService.sign(payload),
      user: result,
    };
  }

  async signin(signinDto: SigninDto) {
    // Auto-create demo account if it doesn't exist and user is trying to sign in with demo credentials
    if (signinDto.email === 'admin@hr-pro.com' && signinDto.password === 'admin123') {
      const existingUser = await this.usersService.findByEmail('admin@hr-pro.com');
      if (!existingUser) {
        // Create demo account on-the-fly
        try {
          await this.usersService.create(
            'admin@hr-pro.com',
            'admin123',
            'Admin User',
          );
          console.log('✅ Auto-created demo account: admin@hr-pro.com');
        } catch (error) {
          console.error('❌ Failed to auto-create demo account:', error);
          // Continue with normal validation flow
        }
      }
    }

    const user = await this.usersService.validateUser(
      signinDto.email,
      signinDto.password,
    );

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { email: user.email, sub: user.id };

    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }
}

