import { Body, Controller, Patch, UseGuards } from '@nestjs/common';
import { UserDto } from '@/account/dto/user.dto';
import { ResponseMessage } from '@/common/decorator/response-message.decorator';
import { AccessTokenGuard } from './guard/accessToken.guard';
import { UserService } from './user.service';
import { UpdateProfileImageRequest } from './dto/update-profile-image.dto';
import { AuthUser } from './decorator/authUser.decorator';
import { Account } from './entity/account.entity';

@UseGuards(AccessTokenGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Patch('profile-image')
  @ResponseMessage('사용자 프로필 이미지 수정에 성공했습니다.')
  async updateProfileImage(@AuthUser() user: Account, @Body() body: UpdateProfileImageRequest) {
    const updatedUser = await this.userService.updateProfileImage(user.id, body.profileImage);
    return new UserDto(updatedUser);
  }
}
