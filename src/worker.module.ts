import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { WorkerConsumer } from './worker/worker.consumer';

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        port: 6379,
        host: 'localhost',
      },
    }),
  ],
  providers: [WorkerConsumer],
})
export class WorkerModule {}
