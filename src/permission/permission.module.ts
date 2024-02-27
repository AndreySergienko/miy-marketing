import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Permission } from './models/persmissions.model';
import { PermissionService } from './permission.service';
import { PermissionController } from './permission.controller';
import { User } from '../user/models/user.model';
import { UserPermission } from './models/user-permission.model';

@Module({
  controllers: [PermissionController],
  providers: [PermissionService],
  exports: [PermissionService],
  imports: [SequelizeModule.forFeature([Permission, User, UserPermission])],
})
export class PermissionModule {}
