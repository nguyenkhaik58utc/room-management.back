import { Injectable } from '@nestjs/common'; // giả sử bạn có PrismaService
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateUserDto) {
    return this.prisma.users.create({
      data,
    });
  }
}
