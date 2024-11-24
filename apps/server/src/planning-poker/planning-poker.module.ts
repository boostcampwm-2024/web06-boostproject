import { Module } from '@nestjs/common';
import { PlanningPokerGateway } from './gateway/planning-poker.gateway';

@Module({
  providers: [PlanningPokerGateway],
})
export class PlanningPokerModule {}
