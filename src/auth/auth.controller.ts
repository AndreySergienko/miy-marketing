import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ConfirmEmailDto, LoginDto, RegistrationDto } from './types/auth.types';
import { AuthService } from './auth.service';
import { ConfirmEmail } from './auth.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('registration')
  async registration(@Body() registrationDto: RegistrationDto) {
    try {
      return await this.authService.registration(registrationDto);
    } catch (e) {
      throw new HttpException({ message: e.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('repeat-mail')
  async repeatSendMail(@Body() chatId: number) {
    return await this.authService.repeatSendMail(chatId);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('logout')
  async logout() {
    await this.authService.logout();
  }

  @Get('confirm-email/:email/:mailCode')
  async confirmEmail(@ConfirmEmail() confirmEmailDto: ConfirmEmailDto) {
    return await this.authService.validateSendMail(confirmEmailDto);
  }
}
