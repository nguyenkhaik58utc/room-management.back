import { Controller, Post, Body, Get, Query, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import { LoginUserDto } from '../user/dto/user.dto';
import { UserService } from '../user/user.service';
import { TokenService } from '../token/token.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService,
    private userService: UserService,
    private readonly tokenService: TokenService) {}

  @Post('register')
  async register(@Body() body: { email: string; password: string; name: string }) {
    return this.authService.register(body.email, body.password, body.name);
  }

  @Get('verify')
  async verify(@Query('token') token: string) {
    return this.authService.verifyAccount(token);
  }
  
  @Post('forgot-password')
  async forgotPassword(@Body() body: { email: string }) {
    return this.authService.forgotPassword(body.email);
  }

  @Post('reset-password')
  async resetPassword(@Body() body: { token: string; newPassword: string }) {
    return this.authService.resetPassword(body.token, body.newPassword);
  }
  @Post('login')
  @ApiOperation({ summary: 'Đăng nhập để lấy JWT token' })
  @ApiBody({ type: LoginUserDto })
  async login(@Body(new ValidationPipe()) loginDto: LoginUserDto) {
    const user = await this.userService.validateUser(loginDto.email, loginDto.password);
    return this.authService.login(user);
  }

  @Post('refresh')
  async refresh(@Body() body: any) {
    const { refresh_token } = body;

    try {
      const payload = this.tokenService.verifyRefreshToken(refresh_token);
      const user = await this.userService.getUserIfRefreshTokenMatches(
        payload.id,
        refresh_token,
      );

      if (!user) {
        return { error: 'Invalid refresh token' };
      }

      const newAccessToken = this.tokenService.generateAccessToken(payload);

      return {
        access_token: newAccessToken,
      };
    } catch (err) {
      return { error: 'Refresh token expired or invalid: ' + err.message };
    }
  }
}
