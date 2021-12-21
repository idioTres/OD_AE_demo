import { UnauthorizedException } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { UniqueTokenStrategy as Strategy } from 'passport-unique-token';
import { AuthService } from './auth.service';

@Injectable()
export class UniqueTokenStrategy extends PassportStrategy(Strategy) {
  public constructor(private authService: AuthService) {
    super();
  }

  public async validate(token: string): Promise<any> {
    const user = await this.authService.validateUser(token);
    if (!user) throw new UnauthorizedException();
    return user;
  }
}
