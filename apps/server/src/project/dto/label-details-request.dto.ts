import { BadRequestException } from '@nestjs/common';
import { IsOptional, IsString, Length, Matches } from 'class-validator';

export class LabelDetailsRequest {
  @IsOptional()
  @IsString()
  @Length(1, 10)
  name: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  @Matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
  color: string;

  validate() {
    if (!this.name || !this.description || !this.color) {
      throw new BadRequestException('Required all fields');
    }
  }
}
