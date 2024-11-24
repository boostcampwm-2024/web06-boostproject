import { IsArray, IsDefined, IsInt } from 'class-validator';

export class UpdateAssigneesRequest {
  @IsDefined()
  @IsArray()
  @IsInt({ each: true })
  assignees: number[];
}
