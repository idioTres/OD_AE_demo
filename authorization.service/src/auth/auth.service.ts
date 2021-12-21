import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/interfaces/user.interface';

@Injectable()
export class AuthService {
  public constructor(private jwtService: JwtService) {}

  public async validateUser(accessCode: string): Promise<any> {
    if (accessCode === 'slave') {
      return {};
    }
    return null;
  }

  public async login(user: User): Promise<any> {
    const payload = user ?? {};
    return { access_token: this.jwtService.sign(payload) };
  }
}
