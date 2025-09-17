import { readFileSync } from 'fs';
import { publicEncrypt, privateDecrypt } from 'crypto';
import path from 'path';
const publicKeyPath = path.join(__dirname, '../../../..', 'public.pem');
const privateKeyPath = path.join(__dirname, '../../../..', 'private.pem');
const PUBLIC_KEY = readFileSync(publicKeyPath, 'utf8');
const PRIVATE_KEY = readFileSync(privateKeyPath, 'utf8');

export class UserEntity {
  constructor(
    public id: number,
    public name: string,
    public email: string,
    private password: string,
    private refreshToken: string 
  ) {}

  setPassword(password: string) {
    const buffer = Buffer.from(password, 'utf8');
    this.password = publicEncrypt(PUBLIC_KEY, buffer).toString('base64');
  }

  checkPassword(password: string): boolean {
    const decrypted = privateDecrypt(PRIVATE_KEY, Buffer.from(this.password, 'base64')).toString('utf8');
    return password === decrypted;
  }
}
