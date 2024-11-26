import { IsNotEmpty, IsString } from 'class-validator';

export class FileNameRequest {
  @IsNotEmpty()
  @IsString()
  fileName: string;
}
