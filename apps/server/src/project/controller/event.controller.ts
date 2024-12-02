import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AccessTokenGuard } from '@/account/guard/accessToken.guard';
import { AuthUser } from '@/account/decorator/authUser.decorator';
import { Account } from '@/account/entity/account.entity';
import { CustomResponse } from '@/project/interface/custom-response.interface';
import { BroadcastService } from '@/project/service/broadcast.service';

@UseGuards(AccessTokenGuard)
@Controller('event')
export class EventController {
  constructor(private broadcastService: BroadcastService) {}

  @Get()
  async polling(
    @AuthUser() user: Account,
    @Res() res: Response,
    @Query('projectId') projectId: number,
    @Query('version') version: number
  ) {
    const customResponse = res as CustomResponse;
    customResponse.userId = user.id;
    customResponse.version = version;

    await this.broadcastService.addConnection(projectId, customResponse);

    res.socket.on('close', () => {
      this.broadcastService.removeConnection(projectId, customResponse);
    });
  }
}
