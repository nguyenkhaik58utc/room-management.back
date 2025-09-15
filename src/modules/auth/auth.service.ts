import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as nodemailer from 'nodemailer';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

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
}
