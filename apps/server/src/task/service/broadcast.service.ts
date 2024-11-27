import { ForbiddenException, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomResponse } from '@/task/domain/custom-response.interface';
import { BaseResponse } from '@/common/BaseResponse';
import { ContributorStatus } from '@/project/enum/contributor-status.enum';
import { Contributor } from '@/project/entity/contributor.entity';

@Injectable()
export class BroadcastService {
  private connections: Map<number, CustomResponse[]> = new Map();

  constructor(
    @InjectRepository(Contributor)
    private contributorRepository: Repository<Contributor>,
    private eventEmitter: EventEmitter2
  ) {
    this.eventEmitter.on('broadcast', (userId: number, projectId: number, event: any) => {
      this.sendConnection(userId, projectId, event);
    });
  }

  async addConnection(projectId: number, res: CustomResponse) {
    await this.validateUserRole(res.userId, projectId);
    res.setTimeout(10000, () => {
      this.removeConnection(projectId, res);
    });
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
    if (!res.headersSent) {
      res.status(404).json(new BaseResponse(404, 'Polling timeout'));
    }
  }

  sendConnection(userId: number, projectId: number, event: any) {
    const connections = this.connections.get(projectId);
    if (!connections) {
      return;
    }

    const filteredConnections = this.connections.get(projectId).filter((r) => r.userId === userId);
    this.connections.set(projectId, filteredConnections);

    for (let i = 0; i < connections.length; i += 1) {
      const res = connections[i];
      if (res.userId !== userId) {
        res.json(new BaseResponse(200, '이벤트가 발생했습니다.', event));
      }
    }
  }

  private async validateUserRole(userId: number, projectId: number) {
    const contributor = await this.contributorRepository.findOneBy({ projectId, userId });
    if (!contributor || contributor.status !== ContributorStatus.ACCEPTED) {
      throw new ForbiddenException('Permission denied');
    }
  }
}
