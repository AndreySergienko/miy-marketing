import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './models/user.model';
import { Permission } from '../permission/models/persmissions.model';
import { UserPermission } from '../permission/models/user-permission.model';
import { PermissionModule } from '../permission/permission.module';

@Module({
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
  imports: [
    SequelizeModule.forFeature([User, Permission, UserPermission]),
    PermissionModule,
  ],
})
export class UserModule {}
