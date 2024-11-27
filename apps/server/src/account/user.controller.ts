import { Controller, Get, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { ResponseMessage } from '@/common/decorator/response-message.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ResponseMessage('유저 정보가 성공적으로 조회되었습니다.')
  async searchUsers(@Query('search') query: string) {
    return this.userService.searchUsers(query);
  }
}
