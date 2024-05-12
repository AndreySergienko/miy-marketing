import { Module } from '@nestjs/common';
import { QueuesService } from './queues.service';
import { SlotsModule } from '../slots/slots.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { Slots } from '../slots/models/slots.model';

@Module({
  providers: [QueuesService],
  imports: [SequelizeModule.forFeature([Slots]), SlotsModule],
})
export class QueuesModule {}
