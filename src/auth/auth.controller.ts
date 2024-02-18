import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ConfirmEmailDto, LoginDto, RegistrationDto } from './types/auth.types';
import { AuthService } from './auth.service';
import { ConfirmEmail } from './auth.decorator';
import { Public } from './decorators/public-auth.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('registration')
  async registration(@Body() registrationDto: RegistrationDto) {
    try {
      return await this.authService.registration(registrationDto);
    } catch (e) {
      throw new HttpException({ message: e.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Public()
  @Post('repeat-mail')
  async repeatSendMail(@Body() chatId: number) {
    return await this.authService.repeatSendMail(chatId);
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
  async confirmEmail(@ConfirmEmail() confirmEmailDto: ConfirmEmailDto) {
    return await this.authService.validateSendMail(confirmEmailDto);
  }
}
