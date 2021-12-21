import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { UniqueTokenStrategy } from './unique-token.strategy';

const key = 'srlab';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: key,
      signOptions: { algorithm: 'HS256', expiresIn: '5min' },
    }),
  ],
  providers: [AuthService, UniqueTokenStrategy, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
