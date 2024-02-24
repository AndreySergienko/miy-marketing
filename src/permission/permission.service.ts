import { Injectable } from '@nestjs/common';
import { Permission } from './models/persmissions.model';
import { InjectModel } from '@nestjs/sequelize';
import { PermissionCreateDto } from './types/permission.types';
import SuccessMessages from '../modules/errors/SuccessMessages';
import PermissionProvider from './PermissionProvider';

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
      // throw new Error(ErrorMessages.PERMISSION_HAS_DEFINED(value));
    }
    await this.permissionRepository.create(dto);
    return SuccessMessages.CREATE_PERMISSION(value);
  }

  async getIdsDefaultRoles() {
    const permissions = await this.permissionRepository.findAll({
      where: {
        id: PermissionProvider.validateUserPermissions,
      },
    });
    return permissions.map((permission) => permission.id);
  }

  update() {}

  delete() {}
}
