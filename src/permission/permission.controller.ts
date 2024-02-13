import { Body, Controller, Post } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { PermissionCreateDto } from './types/permission.types';

@Controller('permission')
export class PermissionController {
  constructor(private permissionService: PermissionService) {}

  @Post('create')
  async create(@Body() dto: PermissionCreateDto) {
    return await this.permissionService.create(dto);
  }
}
