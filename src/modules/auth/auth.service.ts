import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { UserEntity } from '../user/entities/user.model';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async register(email: string, password: string, name: string) {
    const verifyToken = this.jwtService.sign(
      { name: name, email: email, password: password },
      {
        secret: process.env.JWT_KEY ?? 'xxx',
        expiresIn: '15m',
      },
    );
    const userEntity = new UserEntity(0, name, email, '', '');
    await userEntity.setPassword(password);

    const user = await this.prisma.users.create({
      data: {
        email,
        password: userEntity['password'],
        name,
        verifyToken,
      },
    });

    await this.sendVerificationEmail(user.email, verifyToken);

    return { message: 'success' };
  }

  async sendVerificationEmail(email: string, token: string) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    const appUrl = this.configService.get<string>('APP_URL');
    const verifyUrl = `${appUrl}/auth/verify?token=${token}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Xác thực tài khoản',
      html: `<p>Nhấn vào link để xác thực tài khoản:</p>
             <a href="${verifyUrl}">${verifyUrl}</a>`,
    });
  }

  async verifyAccount(token: string): Promise<boolean> {
    const user = await this.prisma.users.findFirst({
      where: { verifyToken: token },
    });

    if (!user) {
      return false
    }

    await this.prisma.users.update({
      where: { id: user.id },
      data: { isVerified: true, verifyToken: null },
    });

    return true;
  }
  async forgotPassword(email: string) {
    const user = await this.prisma.users.findUnique({
      where: { email: email },
    });
    if (!user) {
      throw new Error('Email invalid');
    }

    const resetToken = this.jwtService.sign(
      { email: email },
      {
        secret: process.env.JWT_KEY ?? 'xxx',
        expiresIn: '15m',
      },
    );

    await this.prisma.users.update({
      where: { id: user.id },
      data: { verifyToken: resetToken },
    });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    const appUrl = this.configService.get<string>('APP_URL');
    const resetUrl = `${appUrl}/auth/reset-password?token=${resetToken}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Khôi phục mật khẩu',
      html: `<p>Nhấn vào link để đặt lại mật khẩu (có hiệu lực 1 giờ):</p>
             <a href="${resetUrl}">${resetUrl}</a>`,
    });

    return { message: 'Password reset email has been sent' };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.prisma.users.findFirst({
      where: {
        verifyToken: token,
      },
    });

    if (!user) {
      throw new Error('Token invalid or expired');
    }

    const userEntity = new UserEntity(0, user.name, user.email, '', '');
    await userEntity.setPassword(newPassword);

    await this.prisma.users.update({
      where: { id: user.id },
      data: {
        password: userEntity['password'],
        verifyToken: null,
      },
    });

    return { message: 'Reset success.' };
  }

  async saveRefreshToken(userId: number, token: string) {
    await this.userService.updateUser(userId, { refreshToken: token });
  }

  async login(user: any) {
    const accessToken = this.jwtService.sign(user, {
      secret: process.env.JWT_KEY ?? 'xxx',
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(user, {
      secret: process.env.JWT_KEY ?? 'xxx',
      expiresIn: '7d',
    });

    await this.saveRefreshToken(user.id as number, refreshToken);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      ...user,
    };
  }

  async logout(userId: number) {
    await this.userService.updateUser(userId, { refreshToken: '' });
  }
}
