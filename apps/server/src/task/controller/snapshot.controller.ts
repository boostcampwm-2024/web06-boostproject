import { Controller, Get, Query, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { AccessTokenGuard } from '@/account/guard/accessToken.guard';
import { TaskService } from '../service/task.service';
import { AuthUser } from '@/account/decorator/authUser.decorator';
import { Account } from '@/account/entity/account.entity';
import { CustomResponse } from '../domain/custom-response.interface';

@UseGuards(AccessTokenGuard)
@Controller('snapshot')
export class SnapshotController {
  constructor(private taskService: TaskService) {}

  @Get()
  polling(
    @AuthUser() user: Account,
    @Req() req: Request,
    @Res() res: Response,
    @Query('projectId') projectId: number
  ) {
    const customResponse = res as CustomResponse;
    customResponse.userId = user.id;

    this.taskService.addConnection(projectId, customResponse);

    req.socket.on('close', () => {
      this.taskService.removeConnection(projectId, customResponse);
    });
  }
}
