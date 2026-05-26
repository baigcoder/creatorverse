import { Module } from '@nestjs/common';
import { CommonModule } from '../../common/common.module';
import { MarketingController } from './marketing.controller';
import { MarketingService } from './marketing.service';

@Module({
  imports: [CommonModule],
  controllers: [MarketingController],
  providers: [MarketingService],
})
export class MarketingModule {}
