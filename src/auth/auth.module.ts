import { Global, Module } from '@nestjs/common';
import { AuthService } from './auth.service';

@Global()
@Module({
  controllers: [],
  providers: [AuthService],
  exports: [],
  imports: [],
})
export class AuthModule {}
