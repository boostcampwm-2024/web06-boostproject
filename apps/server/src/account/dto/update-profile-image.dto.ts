import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateProfileImageRequest {
  @IsNotEmpty()
  @IsString()
  profileImage: string;
}
