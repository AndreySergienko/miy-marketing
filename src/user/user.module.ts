import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './models/user.model';
import { Permission } from '../permission/models/persmissions.model';
import { UserPermission } from '../permission/models/user-permission.model';
import { PermissionModule } from '../permission/permission.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { NodemailerModule } from '../nodemailer/nodemailer.module';
import { NodemailerService } from '../nodemailer/nodemailer.service';
import { Mail } from '../nodemailer/model/nodemailer.model';
import { Channel } from '../channels/models/channels.model';
import { UserChannel } from '../channels/models/user-channel.model';
import { UserBank } from '../payments/models/user-bank.model';

@Module({
  controllers: [UserController],
  providers: [UserService, JwtService, NodemailerService],
  exports: [UserService],
  imports: [
    SequelizeModule.forFeature([
      User,
      Permission,
      UserPermission,
      Mail,
      Channel,
      UserChannel,
      UserBank,
    ]),
    PermissionModule,
    JwtModule,
    NodemailerModule,
  ],
})
export class UserModule {}
