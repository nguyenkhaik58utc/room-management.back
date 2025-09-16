import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as nodemailer from 'nodemailer';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private readonly configService: ConfigService) {}

  async register(email: string, password: string, name: string) {
    const verifyToken = randomBytes(32).toString('hex');

    const user = await this.prisma.users.create({
      data: {
        email,
        password,
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

    const verifyUrl = `http://localhost:3000/auth/verify?token=${token}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Xác thực tài khoản',
      html: `<p>Nhấn vào link để xác thực tài khoản:</p>
             <a href="${verifyUrl}">${verifyUrl}</a>`,
    });
  }

  async verifyAccount(token: string) {
    const user = await this.prisma.users.findFirst({
      where: { verifyToken: token },
    });

    if (!user) {
      throw new Error('Token invalid');
    }

    await this.prisma.users.update({
      where: { id: user.id },
      data: { isVerified: true, verifyToken: null },
    });

    return { message: 'Success.' };
  }
  async forgotPassword(email: string) {
    const user = await this.prisma.users.findUnique({ where: { email: email } });
    if (!user) {
      throw new Error('Email invalid');
    }

    const resetToken = randomBytes(32).toString('hex');
    const expire = new Date();
    expire.setHours(expire.getHours() + 1);

    await this.prisma.users.update({
      where: { id: user.id },
      data: { verifyToken: resetToken, resetTokenExp: expire },
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
        resetTokenExp: { gt: new Date() },
      },
    });

    if (!user) {
      throw new Error('Token invalid or expired');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.users.update({
      where: { id: user.id },
      data: { password: hashedPassword, verifyToken: null, resetTokenExp: null },
    });

    return { message: 'Reset success.' };
  }
}
