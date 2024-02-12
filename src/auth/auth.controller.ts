import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ConfirmEmailDto, RegistrationDto } from './types/auth.types';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('registration')
  async registration(@Body() registrationDto: RegistrationDto) {
    try {
      await this.authService.registration(registrationDto);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error,
        },
        HttpStatus.FORBIDDEN,
      );
    }
  }

  @Post('repeat-mail')
  async repeatSendMail(@Body() chatId: number) {
    try {
      return await this.authService.repeatSendMail(chatId);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error,
        },
        HttpStatus.FORBIDDEN,
      );
    }
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login() {
    try {
      // return this.authService.login();
    } catch (e) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: 'Что-то пошло не так',
        },
        HttpStatus.FORBIDDEN,
      );
    }
  }

  @Get('logout')
  async logout() {
    await this.authService.logout();
  }

  @Post('confirm-email')
  async confirmEmail(@Body() confirmEmailDto: ConfirmEmailDto) {}
}
