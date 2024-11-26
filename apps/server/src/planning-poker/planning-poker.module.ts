import { Module } from '@nestjs/common';
import { PlanningPokerGateway } from './gateway/planning-poker.gateway';
import { AccountModule } from '@/account/account.module';

@Module({
  providers: [PlanningPokerGateway],
  imports: [AccountModule],
})
export class PlanningPokerModule {}
