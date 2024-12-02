import { BadRequestException } from '@nestjs/common';
import { IsOptional, IsString, Length, Matches } from 'class-validator';

export class SprintDetailsRequest {
  @IsOptional()
  @IsString()
  @Length(1, 20)
  name: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  startDate: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  endDate: string;

  validate() {
    if (!this.name || !this.startDate || !this.endDate) {
      throw new BadRequestException('Required all fields');
    }
  }

  validateDuration() {
    if (!this.startDate && !this.endDate) {
      return;
    }
    if (!this.startDate || !this.endDate) {
      throw new BadRequestException('Required start date or end date');
    }
  }
}
