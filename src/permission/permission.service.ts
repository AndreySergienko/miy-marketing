import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Permission } from './models/persmissions.model';
import { InjectModel } from '@nestjs/sequelize';
import { PermissionCreateDto } from './types/permission.types';
import { User } from '../user/models/user.model';
import PermissionsErrorMessages from './messages/PermissionsErrorMessages';
import PermissionsSuccessMessages from './messages/PermissionsSuccessMessages';

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
        PermissionsErrorMessages.PERMISSION_HAS_DEFINED(value),
        HttpStatus.BAD_REQUEST,
      );
    }
    await this.permissionRepository.create(dto);
    return PermissionsSuccessMessages.CREATE_PERMISSION(value);
  }

  public async getIdsUserPermissions(user: User) {
    return user.permissions.map((permission) => permission.id);
  }

  public updatePermissions<T extends number[]>(
    newPermissions: T,
    oldPermissions: T,
  ) {
    return oldPermissions.length
      ? newPermissions.concat(oldPermissions)
      : newPermissions;
  }
}
