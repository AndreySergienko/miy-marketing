import { Module } from '@nestjs/common';
import { QueuesService } from './queues.service';
import { SlotsModule } from '../slots/slots.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { Slots } from '../slots/models/slots.model';
import { User } from '../user/models/user.model';
import { UserModule } from '../user/user.module';

@Module({
  providers: [QueuesService],
  imports: [SequelizeModule.forFeature([Slots, User]), SlotsModule, UserModule],
})
export class QueuesModule {}
