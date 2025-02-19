import {
  Body,
  Controller,
  Get,
  HttpException,
  Post,
  Put,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Perms } from '../auth/decorators/permission-auth.decorator';
import {
  BanUserDto,
  PardonUserDto,
  TaxRateDto,
  UpdateEmailDto,
  UpdatePasswordDto,
  UpdateUserDto,
  UploadDocumentDto,
} from './types/user.types';
import PermissionStore from '../permission/PermissionStore';
import { getToken } from '../token/token.utils';
import { Public } from '../auth/decorators/public-auth.decorator';
import * as process from 'node:process';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import type { Express } from 'express';
import 'multer';
import { documentFileFilter, editFileName } from '../utils/file-upload.utils';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Perms(PermissionStore.CAN_BAN)
  @Post('ban')
  async ban(@Body() dto: BanUserDto) {
    return await this.userService.banUser(dto);
  }

  @Perms(PermissionStore.CAN_PARDON)
  @Post('pardon')
  async pardon(@Body() dto: PardonUserDto) {
    return await this.userService.pardonUser(dto);
  }

  @Perms(PermissionStore.CAN_USER_UPDATE)
  @Put('update/email')
  async updateEmail(@Req() req: Request, @Body() dto: UpdateEmailDto) {
    return this.userService.updateEmail(getToken(req), dto);
  }

  @Put('update')
  async updateUser(@Req() req: Request, @Body() dto: UpdateUserDto) {
    return await this.userService.updateUser(getToken(req), dto);
  }

  @Put('update/password')
  async updatePassword(@Req() req: Request, @Body() dto: UpdatePasswordDto) {
    return await this.userService.updatePassword(getToken(req), dto);
  }

  @Post('update/document')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: '/uploads/',
        filename: editFileName,
      }),
      fileFilter: documentFileFilter,
    }),
  )
  async updateDocument(
    @Req() req: Request,
    @UploadedFile()
    file: Express.Multer.File,
    @Body()
    dto: UploadDocumentDto,
  ) {
    return await this.userService.updateDocument(getToken(req), file, dto);
  }

  @Get('me')
  async getMe(@Req() req: Request) {
    return await this.userService.getMe(getToken(req));
  }

  @Public()
  @Post('set/admin')
  setAdmin(@Body() { userId, token }: { userId: number; token: string }) {
    if (token !== process.env.SECRET_TOKEN) return;
    return this.userService.setAdmin(userId);
  }

  @Put('update/tax-rate')
  async updateTaxRate(@Req() req: Request, @Body() dto: TaxRateDto) {
    const userIdOrError = this.userService.getId(getToken(req));

    // Проверяем, является ли userIdOrError числом
    if (userIdOrError instanceof HttpException) {
      throw userIdOrError;
    }

    const userId = userIdOrError as number;
    return await this.userService.updateTaxRate(userId, dto.rate);
  }

  @Get('me/tax-rate')
  async getTaxRate(@Req() req: Request) {
    const userIdOrError = this.userService.getId(getToken(req));

    // Проверяем, является ли userIdOrError числом
    if (userIdOrError instanceof HttpException) {
      throw userIdOrError;
    }

    const userId = userIdOrError as number;
    return await this.userService.getTaxRate(userId);
  }
}
