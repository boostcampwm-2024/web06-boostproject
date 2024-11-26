import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as ShareDB from 'sharedb';
import { Task } from '@/task/domain/task.entity';
import { Section } from '@/task/domain/section.entity';
import { MoveTaskResponse } from '@/task/dto/move-task-response.dto';
import { TaskResponse } from '@/task/dto/task-response.dto';
import { DeleteTaskResponse } from '@/task/dto/delete-task-response.dto';
import { CreateTaskResponse } from '@/task/dto/create-task-response.dto';
import { TaskEvent } from '@/task/dto/task-event.dto';
import { EventType } from '@/task/enum/eventType.enum';
import { Contributor } from '@/project/entity/contributor.entity';
import { BroadcastService } from '@/task/service/broadcast.service';
import { ContributorStatus } from '@/project/enum/contributor-status.enum';
import { TaskEventResponse } from '@/task/dto/task-event-response.dto';
import { UpdateTaskDetailsRequest } from '@/task/dto/update-task-details-request.dto';
import { UpdateTaskDetailsResponse } from '@/task/dto/update-task-details-response.dto';
import { Sprint } from '@/project/entity/sprint.entity';
import { Label } from '@/project/entity/label.entity';
import { TaskLabel } from '@/task/domain/task-label.entity';
import { LabelDetailsResponse } from '@/project/dto/label-details-response.dto';
import { TaskAssignee } from '@/task/domain/task-assignee.entity';
import { AssigneeDetailsResponse } from '@/task/dto/assignee-details-response.dto';
import { TaskDetailsResponse } from '@/task/dto/task-details-response.dto';
import { SprintDetailsResponse } from '@/project/dto/sprint-details-response.dto';
import { SubTask } from '@/task/domain/subTask.entity';
import { CreateSubTaskResponse } from '@/task/dto/create-subTask-response.dto';

const { defaultType: json0 } = ShareDB.types;

@Injectable()
export class TaskService {
  private logger = new Logger(TaskService.name);

  private operations: Map<number, TaskEvent[]> = new Map();

  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(Section)
    private sectionRepository: Repository<Section>,
    @InjectRepository(Contributor)
    private contributorRepository: Repository<Contributor>,
    @InjectRepository(Sprint)
    private sprintRepository: Repository<Sprint>,
    @InjectRepository(Label)
    private labelRepository: Repository<Label>,
    @InjectRepository(TaskLabel)
    private taskLabelRepository: Repository<TaskLabel>,
    @InjectRepository(TaskAssignee)
    private taskAssigneeRepository: Repository<TaskAssignee>,
    @InjectRepository(SubTask)
    private subTaskRepository: Repository<SubTask>,
    private dataSource: DataSource,
    private broadcastService: BroadcastService,
    private eventEmitter: EventEmitter2
  ) {
    this.eventEmitter.on('broadcast', (userId: number, projectId: number, event: TaskEvent) => {
      this.broadcastService.sendConnection(userId, projectId, event);
    });
    this.eventEmitter.on(
      'operationAdded',
      async (userId: number, projectId: number, taskId: number) => {
        try {
          await this.dequeue(userId, projectId, taskId);
        } catch (e) {
          this.logger.error(e);
        }
      }
    );
  }

  async enqueue(userId: number, projectId: number, taskEvent: TaskEvent) {
    const { taskId } = taskEvent;
    await this.validateUserRole(userId, projectId);
    const currentEvents = this.operations.get(taskId) || [];
    this.operations.set(taskId, [...currentEvents, taskEvent]);
    this.eventEmitter.emit('operationAdded', userId, projectId, taskId);
  }

  private async dequeue(userId: number, projectId: number, taskId: number) {
    const taskEventQueue = this.operations.get(taskId);
    if (!taskEventQueue) {
      return;
    }

    const initialTask = await this.taskRepository.findOneBy({ id: taskId });
    let accumulateOperations = [];
    while (taskEventQueue.length) {
      const taskEvent = taskEventQueue.shift();
      const operation = this.convertToOperation(taskEvent);

      const transformedOperation = accumulateOperations.length
        ? json0.transform(operation, accumulateOperations, 'right')
        : operation;

      accumulateOperations = json0.compose(accumulateOperations, transformedOperation);
    }

    const newText = json0.apply(initialTask.title, accumulateOperations);
    const result = { ...initialTask, title: newText };
    await this.taskRepository.save(result);
    const eventPublisher = accumulateOperations.length <= 1 ? userId : null;
    this.eventEmitter.emit(
      'broadcast',
      eventPublisher,
      projectId,
      TaskEventResponse.of(taskId, 'TITLE')
    );
  }

  private convertToOperation(taskEvent: TaskEvent) {
    const { event } = taskEvent;
    const { content, position } = taskEvent.title;

    switch (event) {
      case EventType.INSERT_TITLE:
        return [{ p: [position], si: content }];
      case EventType.DELETE_TITLE:
        return [{ p: [position], sd: content }];
      default:
        throw new BadRequestException('Invalid event type');
    }
  }

  async create(userId: number, projectId: number, taskEvent: TaskEvent) {
    await this.validateUserRole(userId, projectId);
    if (!taskEvent.sectionId) {
      throw new BadRequestException('Required section id');
    }
    const section = await this.findSectionOrThrow(taskEvent.sectionId);
    if (section.project.id !== projectId) {
      throw new NotFoundException('Project not found');
    }
    const task = await this.taskRepository.save({
      position: taskEvent.position,
      section,
    });

    this.eventEmitter.emit('broadcast', userId, projectId, TaskEventResponse.of(task.id, 'CARD'));
    return new CreateTaskResponse(task);
  }

  async getAll(userId: number, projectId: number) {
    await this.validateUserRole(userId, projectId);
    const sections = await this.sectionRepository.find({
      where: { project: { id: projectId } },
      order: { id: 'ASC' },
    });

    const tasks = await this.taskRepository.find({
      where: { section: { project: { id: projectId } } },
      relations: ['section'],
      select: ['id', 'title', 'description', 'position', 'section'],
    });

    const taskBySection = [];
    sections.forEach((section) => {
      taskBySection.push({
        id: section.id,
        name: section.name,
        tasks: tasks
          .filter((task) => task.section.id === section.id)
          .map((task) => new TaskResponse(task)),
      });
    });

    return taskBySection;
  }

  async move(userId: number, projectId: number, taskEvent: TaskEvent) {
    await this.validateUserRole(userId, projectId);
    if (!taskEvent.taskId || !taskEvent.sectionId || !taskEvent.position) {
      throw new BadRequestException('Required section id');
    }
    const task = await this.findTaskOrThrow(taskEvent.taskId);
    const section = await this.findSectionOrThrow(taskEvent.sectionId);
    if (task.section.project.id !== projectId || section.project.id !== projectId) {
      throw new NotFoundException('Project not found');
    }
    task.position = taskEvent.position;
    task.section = section;
    await this.taskRepository.save(task);

    this.eventEmitter.emit(
      'broadcast',
      userId,
      projectId,
      TaskEventResponse.of(taskEvent.taskId, 'CARD')
    );
    return new MoveTaskResponse(task);
  }

  async updateDetails(userId: number, taskId: number, body: UpdateTaskDetailsRequest) {
    const task = await this.findTaskOrThrow(taskId);
    await this.validateUserRole(userId, task.section.project.id);
    const sprint = await this.findSprintOrNull(body.sprintId, task.section.project.id);
    task.updateDetails(body);
    this.taskRepository.save(task);
    return new UpdateTaskDetailsResponse(
      task.id,
      body,
      sprint ? new SprintDetailsResponse(sprint) : undefined
    );
  }

  async get(userId: number, taskId: number) {
    const task = await this.findTaskOrThrow(taskId);
    await this.validateUserRole(userId, task.section.project.id);
    return new TaskResponse(task);
  }

  async delete(userId: number, projectId: number, taskEvent: TaskEvent) {
    await this.validateUserRole(userId, projectId);
    if (!taskEvent.taskId) {
      throw new BadRequestException('Required task id');
    }
    const task = await this.findTaskOrThrow(taskEvent.taskId);
    if (!task || task.section.project.id !== projectId) {
      throw new NotFoundException('Task not found');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const taskId = task.id;
      await queryRunner.manager.delete(TaskLabel, { taskId });
      await queryRunner.manager.delete(TaskAssignee, { taskId });
      await queryRunner.manager.delete(SubTask, { taskId });
      await queryRunner.manager.delete(Task, { id: taskId });
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
    this.eventEmitter.emit(
      'broadcast',
      userId,
      projectId,
      TaskEventResponse.of(taskEvent.taskId, 'CARD')
    );
    return new DeleteTaskResponse(taskEvent.taskId);
  }

  async deleteWithoutEvent(userId: number, taskId: number) {
    const task = await this.findTaskOrThrow(taskId);
    await this.delete(userId, task.section.project.id, {
      taskId,
      event: EventType.DELETE_TASK,
    } as TaskEvent);
  }

  async updateLabels(userId: number, taskId: number, labelIds: number[]) {
    const task = await this.findTaskOrThrow(taskId);
    const projectId = task.section.project.id;
    await this.validateUserRole(userId, projectId);
    const labels = await this.labelRepository.findBy({ projectId, id: In(labelIds) });
    if (labelIds.length !== labels.length) {
      throw new NotFoundException('Label not found');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.delete(TaskLabel, { taskId });
      for (let i = 0; i < labelIds.length; i += 1) {
        await queryRunner.manager.save(TaskLabel, { projectId, taskId, labelId: labelIds[i] });
      }
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
    return { taskId, labels: labels.map((label) => new LabelDetailsResponse(label)) };
  }

  async updateAssignees(userId: number, taskId: number, assigneeIds: number[]) {
    const task = await this.findTaskOrThrow(taskId);
    const projectId = task.section.project.id;
    await this.validateUserRole(userId, projectId);
    let records = [];
    if (assigneeIds.length !== 0) {
      records = await this.contributorRepository
        .createQueryBuilder('c')
        .leftJoin('account', 'a', 'c.userId = a.id')
        .where('c.projectId = :projectId', { projectId })
        .andWhere('c.status = :status', { status: ContributorStatus.ACCEPTED })
        .andWhere('c.userId IN (:...userIds)', { userIds: assigneeIds })
        .addSelect(['a.username'])
        .getRawMany();
    }
    if (records.length !== assigneeIds.length) {
      throw new NotFoundException('Assignees not found');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.delete(TaskAssignee, { taskId });
      for (let i = 0; i < assigneeIds.length; i += 1) {
        await queryRunner.manager.save(TaskAssignee, {
          projectId,
          taskId,
          accountId: assigneeIds[i],
        });
      }
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
    return {
      taskId,
      assignees: records.map(
        (record) => new AssigneeDetailsResponse(record.c_userId, record.a_username, '')
      ),
    };
  }

  async getTaskDetail(userId: number, taskId: number) {
    const task = await this.findTaskOrThrow(taskId);
    await this.validateUserRole(userId, task.section.project.id);

    const result = new TaskDetailsResponse(task);
    const sprint = task.sprintId
      ? await this.sprintRepository.findOneBy({ id: task.sprintId })
      : null;
    result.setSprint(sprint ? new SprintDetailsResponse(sprint) : null);

    const taskAssigneeRecords = await this.taskAssigneeRepository
      .createQueryBuilder('ta')
      .leftJoin('account', 'a', 'ta.accountId = a.id')
      .where('ta.taskId = :taskId', { taskId })
      .addSelect(['a.username'])
      .getRawMany();
    result.setAssignees(
      taskAssigneeRecords.map(
        (record) => new AssigneeDetailsResponse(record.ta_accountId, record.a_username, '')
      )
    );

    const labels = await this.labelRepository
      .createQueryBuilder('l')
      .leftJoin('task_label', 'tl', 'l.id = tl.labelId')
      .where('tl.taskId = :taskId', { taskId })
      .getMany();
    result.setLabels(labels.map((label) => new LabelDetailsResponse(label)));

    const subTasks = await this.subTaskRepository.findBy({ taskId });
    result.setSubtasks(subTasks.map((subTask) => new CreateSubTaskResponse(subTask)));
    return result;
  }

  async getStatistic(userId: number, projectId: number) {
    await this.validateUserRole(userId, projectId);
    const totalTask = await this.taskRepository
      .createQueryBuilder('t')
      .innerJoin('t.section', 'section')
      .innerJoin('section.project', 'project')
      .where('project.id = :projectId', { projectId })
      .getCount();

    const doneTask = await this.taskRepository
      .createQueryBuilder('t')
      .innerJoin('t.section', 'section')
      .innerJoin('section.project', 'project')
      .where('project.id = :projectId', { projectId })
      .andWhere('section.name = :name', { name: 'Done' })
      .getCount();

    const contributorStatistic = await this.contributorRepository
      .createQueryBuilder('c')
      .leftJoin('account', 'a', 'c.userId = a.id')
      .leftJoin('task_assignee', 'ta', 'c.userId = ta.accountId')
      .where('c.projectId = :projectId OR ta.projectId IS NULL', { projectId })
      .andWhere('ta.projectId = :projectId', { projectId })
      .select(['c.userId AS id', 'a.username AS username', 'COUNT(ta.id) AS count'])
      .groupBy('c.userId')
      .getRawMany();
    contributorStatistic.map((statistic) => ({
      ...statistic,
      count: parseInt(statistic.count, 10),
    }));
    return { totalTask, doneTask, contributorStatistic };
  }

  private async validateUserRole(userId: number, projectId: number) {
    const contributor = await this.contributorRepository.findOneBy({ projectId, userId });
    if (!contributor || contributor.status !== ContributorStatus.ACCEPTED) {
      throw new ForbiddenException('Permission denied');
    }
  }

  private async findSprintOrNull(sprintId: number, projectId: number) {
    if (!sprintId) {
      return null;
    }
    const sprint = await this.sprintRepository.findOneBy({ id: sprintId });
    if (!sprint) {
      throw new NotFoundException('Sprint not found');
    }
    if (sprint.projectId !== projectId) {
      throw new BadRequestException('Invalid sprint id');
    }
    return sprint;
  }

  private async findTaskOrThrow(id: number) {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['section', 'section.project'],
    });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return task;
  }

  private async findSectionOrThrow(id: number) {
    const section = await this.sectionRepository.findOne({ where: { id }, relations: ['project'] });
    if (!section) {
      throw new NotFoundException('Section not found');
    }
    return section;
  }
}
