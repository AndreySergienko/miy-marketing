import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Permission } from './models/persmissions.model';
import { InjectModel } from '@nestjs/sequelize';
import { PermissionCreateDto } from './types/permission.types';
import SuccessMessages from '../modules/errors/SuccessMessages';
import PermissionStore from './PermissionStore';
import ErrorMessages from '../modules/errors/ErrorMessages';

@Injectable()
export class PermissionService {
  constructor(
    @InjectModel(Permission) private permissionRepository: typeof Permission,
  ) {}

  async create(dto: PermissionCreateDto) {
    const { value } = dto;
    const permission = await this.permissionRepository.findOne({
      where: { value },
    });
    if (permission) {
      throw new HttpException(
        ErrorMessages.PERMISSION_HAS_DEFINED(value),
        HttpStatus.BAD_REQUEST,
      );
    }
    await this.permissionRepository.create(dto);
    return SuccessMessages.CREATE_PERMISSION(value);
  }

  async getIdsDefaultRoles() {
    const permissions = await this.permissionRepository.findAll({
      where: {
        id: PermissionStore.validateUserPermissions,
      },
    });
    return permissions.map((permission) => permission.id);
  }
}
