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
    await this.authService.registration();
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    try {
      return this.authService.login(req);
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
