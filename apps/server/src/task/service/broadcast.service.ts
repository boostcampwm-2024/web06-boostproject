import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomResponse } from '@/task/domain/custom-response.interface';
import { BaseResponse } from '@/common/BaseResponse';
import { ContributorStatus } from '@/project/enum/contributor-status.enum';
import { Contributor } from '@/project/entity/contributor.entity';
import { EventType } from '@/task/enum/eventType.enum';
import { TaskEventResponse } from '@/task/dto/task-event-response.dto';

@Injectable()
export class BroadcastService {
  private static LIMIT_MINUTES = 30;

  private static PERIOD_MILLISECOND = 500;

  private static PUT_EVENT = [
    EventType.LABELS_CHANGED,
    EventType.SUBTASKS_CHANGED,
    EventType.ASSIGNEES_CHANGED,
    EventType.POSITION_UPDATED,
  ];

  private limitVersion: number;

  private connections: Map<number, CustomResponse[]> = new Map();

  private events: Map<number, { userId: number; event: TaskEventResponse }[]> = new Map();

  constructor(
    @InjectRepository(Contributor)
    private contributorRepository: Repository<Contributor>,
    private eventEmitter: EventEmitter2
  ) {
    this.limitVersion = this.getVersionLimit();

    this.eventEmitter.on('event', (userId: number, projectId: number, event: TaskEventResponse) => {
      this.addEvent(userId, projectId, event);
    });

    setInterval(() => {
      this.events.forEach((value, key) => {
        this.sendConnection(key, value);
      });
    }, BroadcastService.PERIOD_MILLISECOND);

    setInterval(
      () => {
        this.limitVersion = this.getVersionLimit();
        for (const key of this.events.keys()) {
          const filteredEvents = this.events
            .get(key)
            .filter((e) => e.event.version >= this.limitVersion);
          if (filteredEvents.length === 0) {
            this.events.delete(key);
          } else {
            this.events.set(key, filteredEvents);
          }
        }
      },
      BroadcastService.LIMIT_MINUTES * 60 * 1000
    );
  }

  async addConnection(projectId: number, res: CustomResponse) {
    await this.validateUserRole(res.userId, projectId);
    this.validateVersion(res.version);
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

  addEvent(userId: number, projectId: number, response: any) {
    let events = this.events.get(projectId);
    if (!events) {
      events = [];
    }
    if (BroadcastService.PUT_EVENT.includes(response.event)) {
      events = events.filter(
        (e) => e.event.event !== response.event || e.event.task.id !== response.task.id
      );
    }
    events.push({ userId, event: response });
    this.events.set(projectId, events);
  }

  sendConnection(projectId: number, events: { userId: number; event: any }[]) {
    const connections = this.connections.get(projectId);
    if (!connections) {
      return;
    }
    const broadcastUsers = [];

    for (let i = 0; i < connections.length; i += 1) {
      const res = connections[i];
      const result = events.filter((e) => e.userId !== res.userId && res.version < e.event.version);
      if (result.length !== 0) {
        res.json(
          new BaseResponse(
            200,
            '이벤트가 발생했습니다.',
            result.map((response) => response.event)
          )
        );
        broadcastUsers.push(res.userId);
      }
    }
    this.connections.set(
      projectId,
      connections.filter((connection) => !broadcastUsers.includes(connection.userId))
    );
  }

  private async validateUserRole(userId: number, projectId: number) {
    const contributor = await this.contributorRepository.findOneBy({ projectId, userId });
    if (!contributor || contributor.status !== ContributorStatus.ACCEPTED) {
      throw new ForbiddenException('Permission denied');
    }
  }

  private validateVersion(version: number) {
    if (version < this.limitVersion) {
      throw new NotFoundException('Version not found');
    }
  }

  private getVersionLimit() {
    const limit = new Date();
    limit.setMinutes(limit.getMinutes() - BroadcastService.LIMIT_MINUTES);
    return limit.getTime();
  }
}
