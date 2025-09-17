import bcrypt from 'bcrypt';

export class UserEntity {
  constructor(
    public id: number,
    public name: string,
    public email: string,
    private password: string,
    private refreshToken: string,
  ) {}

  async setPassword(password: string) {
    const saltRounds = 12;
    this.password = await bcrypt.hash(password, saltRounds);
  }

  async checkPassword(password: string): Promise<boolean> {
    if (!this.password) {
      throw new Error('Password has not been set');
    }
    return await bcrypt.compare(password, this.password);
  }
}
