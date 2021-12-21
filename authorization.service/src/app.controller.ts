import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth/auth.service';
import { UniqueTokenAuthGuard } from './auth/unique-token-auth.guard';

@Controller()
export class AppController {
  constructor(private authService: AuthService) {}

  @UseGuards(UniqueTokenAuthGuard)
  @Post('auth/login')
  public async login(@Req() req) {
    return this.authService.login(req.user);
  }
}
