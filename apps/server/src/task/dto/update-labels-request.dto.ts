import { IsArray, IsDefined, IsInt } from 'class-validator';

export class UpdateLabelsRequest {
  @IsDefined()
  @IsArray()
  @IsInt({ each: true })
  labels: number[];
}
