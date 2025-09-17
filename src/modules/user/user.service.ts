import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { UserEntity } from './entities/user.model';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async OnModuleInit() {
    await this.seedData();
  }

  async seedData() {
    const newPassword = 'passw0rd@123';
    const dataSeed = new UserEntity(0, 'Admin', 'admin@example.com', '', '');
    await dataSeed.setPassword(newPassword);
    await this.prisma.$transaction(async (tx) => {
      await tx.users.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
          email: dataSeed.email,
          name: dataSeed.name,
          password: dataSeed['password'],
        },
      });
    });
  }

  async createUser(createUserDto: CreateUserDto) {
    const userEntity = new UserEntity(
      0,
      createUserDto.name,
      createUserDto.email,
      '',
      ''
    );
    await userEntity.setPassword(createUserDto.password);

    return this.prisma.users.create({
      data: {
        name: userEntity.name,
        email: userEntity.email,
        password: userEntity['password'],
      },
    });
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto) {
    const data: any = { ...updateUserDto };

    if (updateUserDto.password) {
      const userEntity = new UserEntity(
        id,
        updateUserDto.name ?? '',
        updateUserDto.email ?? '',
        '',
        updateUserDto.refreshToken ?? ''
      );
      await userEntity.setPassword(updateUserDto.password);
      data.password = userEntity['password'];
    }

    return this.prisma.users.update({
      where: { id },
      data,
    });
  }

  async getUsers() {
    return this.prisma.users.findMany({
      select: { id: true, name: true, email: true },
    });
  }

  async getUserById(id: number) {
    return this.prisma.users.findUnique({
      where: { id },
      select: { id: true, name: true, email: true },
    });
  }

  async deleteUser(id: number) {
    return this.prisma.users.delete({ where: { id } });
  }

  async validateUser(email: string, password: string) {
    const user = await this.prisma.users.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('User not found');

    const userEntity = new UserEntity(
      user.id,
      user.name,
      user.email,
      user.password,
      user.verifyToken??""
    );

    const isValid = await userEntity.checkPassword(password);
    if (!isValid) throw new UnauthorizedException('Invalid password');

    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }
  async getUserIfRefreshTokenMatches(userId: number, refreshToken: string) {
    const user = await this.prisma.users.findUnique({ where: { id: userId } });
    if (!user || !user.verifyToken || user.verifyToken !== refreshToken) return null;
    return user;
  };
}
