import { Module } from '@nestjs/common';
import * as process from 'process';
import { ConfigModule } from '@nestjs/config';
import SqlDatabase from './database/samples/SqlDatabase';
import { SequelizeModule } from '@nestjs/sequelize';
import { BotModule } from './bot/bot.module';
import { Bot } from './bot/models/bot.model';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { User } from './user/models/user.model';
import { UserPermission } from './permission/models/user-permission.model';
import { Permission } from './permission/models/persmissions.model';
import { PermissionModule } from './permission/permission.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.envs/.${process.env.STAND}.env`,
    }),
    SequelizeModule.forRoot(
      new SqlDatabase().connect([Bot, User, Permission, UserPermission]),
    ),
    BotModule,
    UserModule,
    AuthModule,
    PermissionModule,
  ],

  controllers: [],
  providers: [],
})
export class AppModule {}
