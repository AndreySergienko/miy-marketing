import { Module } from '@nestjs/common';
import { QueuesService } from './queues.service';
import { UserModule } from '../user/user.module';

@Module({
  providers: [QueuesService],
  imports: [UserModule],
})
export class QueuesModule {}
