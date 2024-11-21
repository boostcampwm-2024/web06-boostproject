import { Injectable } from '@nestjs/common';
import { CustomResponse } from '@/task/domain/custom-response.interface';
import { BaseResponse } from '@/common/BaseResponse';

@Injectable()
export class BroadcastService {
  private connections: Map<number, CustomResponse[]> = new Map();

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

    connections.forEach((res) => {
      if (res.userId !== userId) {
        res.json(new BaseResponse(200, '이벤트가 발생했습니다.', event));
      }
    });
  }
}
