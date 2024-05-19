import { Module } from '@nestjs/common';
import { QueuesService } from './queues.service';
import { SlotsModule } from '../slots/slots.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { Slots } from '../slots/models/slots.model';
import { UserModule } from '../user/user.module';

@Module({
  providers: [QueuesService],
  imports: [SequelizeModule.forFeature([Slots]), SlotsModule, UserModule],
})
export class QueuesModule {}
