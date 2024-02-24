import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as process from 'process';
import { SequelizeModule } from '@nestjs/sequelize';
import SqlDatabase from './database/samples/SqlDatabase';
import { Bot } from './bot/models/bot.model';
import { QueuesModule } from './queues/queues.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.envs/.${process.env.STAND}.env`,
    }),
    SequelizeModule.forRoot(new SqlDatabase().connect([Bot])),
    QueuesModule,
  ],
  providers: [],
})
export class WorkerModule {}
