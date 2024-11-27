import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CustomResponse } from '@/task/domain/custom-response.interface';
import { BaseResponse } from '@/common/BaseResponse';

@Injectable()
export class BroadcastService {
  private connections: Map<number, CustomResponse[]> = new Map();

  constructor(private eventEmitter: EventEmitter2) {
    this.eventEmitter.on('broadcast', (userId: number, projectId: number, event: any) => {
      this.sendConnection(userId, projectId, event);
    });
  }

  addConnection(projectId: number, res: CustomResponse) {
    res.setTimeout(10000);
    if (!this.connections.has(projectId)) {
      this.connections.set(projectId, [res]);
    } else {
      this.connections.get(projectId).push(res);
    }
  }

  removeConnection(projectId: number, res: CustomResponse) {
    const filteredConnections = this.connections
      .get(projectId)
      .filter((r) => r.userId !== res.userId);

    this.connections.set(projectId, filteredConnections);
  }

  sendConnection(userId: number, projectId: number, event: any) {
    const connections = this.connections.get(projectId);
    if (!connections) {
      return;
    }
    for (let i = 0; i < connections.length; i += 1) {
      const res = connections[i];
      if (res.userId !== userId) {
        res.json(new BaseResponse(200, '이벤트가 발생했습니다.', event));
        this.removeConnection(projectId, res);
      }
    }
  }
}
