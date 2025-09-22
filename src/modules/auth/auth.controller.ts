import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  ValidationPipe,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import { CreateUserDto, LoginUserDto } from '../user/dto/user.dto';
import { UserService } from '../user/user.service';
import { TokenService } from '../token/token.service';
import type { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private userService: UserService,
    private readonly configService: ConfigService,
    private readonly tokenService: TokenService,
  ) {}

  @ApiBody({ type: CreateUserDto })
  @Post('register')
  async register(@Body(new ValidationPipe()) body: CreateUserDto) {
    return this.authService.register(body.email, body.password, body.name);
  }

  @Get('verify')
  async verify(@Query('token') token: string, @Res() res: Response) {
    const appUrl = this.configService.get<string>('APP_FRONT_URL');
    try {
      const isValid = await this.authService.verifyAccount(token);
      if (isValid) {
        return res.redirect(302, `${appUrl}/login?verified=true`);
      } else {
        return res.redirect(302, `${appUrl}/login?error=invalid_token`);
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      return res.redirect(302, `${appUrl}/login?error=server_error`);
    }
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
  @Post('login')
  async login(
    @Body(new ValidationPipe()) loginDto: LoginUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.userService.validateUser(
      loginDto.email,
      loginDto.password,
    );

    const result = await this.authService.login(user);

    res.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      access_token: result.access_token,
      id: result.id,
      email: result.email,
      name: result.name,
    };
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
