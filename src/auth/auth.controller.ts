import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import {
  ConfirmEmailDto,
  LoginDto,
  RegistrationDto,
  RepeatEmailDto,
} from './types/auth.types';
import { AuthService } from './auth.service';
import { ConfirmEmail } from './auth.decorator';
import { Public } from './decorators/public-auth.decorator';
import * as process from 'process';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('registration')
  async registration(@Body() registrationDto: RegistrationDto) {
    return await this.authService.registration(registrationDto);
  }

  @Public()
  @Post('repeat-mail')
  async repeatSendMail(@Body() { userId }: RepeatEmailDto) {
    return await this.authService.repeatSendMail(userId);
  }

  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.login(loginDto);
  }

  @Public()
  @Get('logout')
  async logout() {
    await this.authService.logout();
  }

  @Public()
  @Get('confirm-email/:userId/:mailCode')
  async confirmEmail(
    @Res() response: Response,
    @ConfirmEmail() confirmEmailDto: ConfirmEmailDto,
  ) {
    await this.authService.validateSendMail(confirmEmailDto);
    response.redirect(process.env.FRONT_URL);
  }
}
