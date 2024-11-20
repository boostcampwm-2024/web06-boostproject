import { Controller, Get, Query, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { AccessTokenGuard } from '@/account/guard/accessToken.guard';
import { AuthUser } from '@/account/decorator/authUser.decorator';
import { Account } from '@/account/entity/account.entity';
import { CustomResponse } from '@/task/domain/custom-response.interface';
import { BroadcastService } from '@/task/service/broadcast.service';

@UseGuards(AccessTokenGuard)
@Controller('event')
export class EventController {
  constructor(private broadcastService: BroadcastService) {}

  @Get()
  polling(
    @AuthUser() user: Account,
    @Req() req: Request,
    @Res() res: Response,
    @Query('projectId') projectId: number
  ) {
    const customResponse = res as CustomResponse;
    customResponse.userId = user.id;

    this.broadcastService.addConnection(projectId, customResponse);

    req.socket.on('close', () => {
      this.broadcastService.removeConnection(projectId, customResponse);
    });
  }
}
