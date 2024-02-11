import { Module } from '@nestjs/common';
import * as process from 'process';
import { ConfigModule } from '@nestjs/config';
import SqlDatabase from './database/samples/SqlDatabase';
import { SequelizeModule } from '@nestjs/sequelize';
import { BotModule } from './bot/bot.module';
import { Bot } from './bot/models/bot.model';
import { AuthController } from './auth/auth.controller';
import { RolesController } from './roles/roles.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.envs/.${process.env.STAND}.env`,
    }),
    SequelizeModule.forRoot(new SqlDatabase().connect([Bot])),
    BotModule,
  ],

  controllers: [AuthController, RolesController],
  providers: [],
})
export class AppModule {}
