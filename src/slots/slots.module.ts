import { Module } from '@nestjs/common';
import { SlotsService } from './slots.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Slots } from './models/slots.model';
import { Channel } from '../channels/models/channels.model';

@Module({
  imports: [SequelizeModule.forFeature([Slots, Channel])],
  providers: [SlotsService],
  exports: [SlotsService],
})
export class SlotsModule {}
