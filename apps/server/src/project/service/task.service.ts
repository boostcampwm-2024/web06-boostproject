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
import { Task } from '@/project/entity/task.entity';
import { Section } from '@/project/entity/section.entity';
import { MoveTaskResponse } from '@/project/dto/task/move-task-response.dto';
import { TaskResponse } from '@/project/dto/task/task-response.dto';
import { DeleteTaskResponse } from '@/project/dto/task/delete-task-response.dto';
import { CreateTaskResponse } from '@/project/dto/task/create-task-response.dto';
import { TaskEvent } from '@/project/dto/task/task-event.dto';
import { EventType } from '@/project/enum/eventType.enum';
import { Contributor } from '@/project/entity/contributor.entity';
import { ContributorStatus } from '@/project/enum/contributor-status.enum';
import { TaskEventResponse } from '@/project/dto/task/task-event-response.dto';
import { UpdateTaskDetailsRequest } from '@/project/dto/task/update-task-details-request.dto';
import { UpdateTaskDetailsResponse } from '@/project/dto/task/update-task-details-response.dto';
import { Sprint } from '@/project/entity/sprint.entity';
import { Label } from '@/project/entity/label.entity';
import { TaskLabel } from '@/project/entity/task-label.entity';
import { LabelDetailsResponse } from '@/project/dto/label/label-details-response.dto';
import { TaskAssignee } from '@/project/entity/task-assignee.entity';
import { AssigneeDetailsResponse } from '@/project/dto/assignee/assignee-details-response.dto';
import { TaskDetailsResponse } from '@/project/dto/task/task-details-response.dto';
import { SprintDetailsResponse } from '@/project/dto/sprint/sprint-details-response.dto';
import { SubTask } from '@/project/entity/subTask.entity';
import { CreateSubTaskResponse } from '@/project/dto/subtask/create-subTask-response.dto';
import { SubTaskStatus } from '@/project/enum/subTaskStatus.enum';
import { TaskCreatedEvent } from '@/project/event/task-created.event';
import { PositionUpdatedEvent } from '@/project/event/position-updated.event';
import { TaskDeletedEvent } from '@/project/event/task-deleted.event';
import { LabelsChangedEvent } from '@/project/event/labels-changed.event';
import { AssigneesChangedEvent } from '@/project/event/assignees-changed.event';
import { TitleUpdatedEvent } from '@/project/event/title-updated.event';

const { defaultType: json0 } = ShareDB.types;

@Injectable()
export class TaskService {
  private logger = new Logger(TaskService.name);

  private operations: Map<number, { userId: number; taskEvent: TaskEvent }[]> = new Map();

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
    private eventEmitter: EventEmitter2
  ) {
    this.eventEmitter.on('operationAdded', async (projectId: number, taskId: number) => {
      try {
        await this.dequeue(projectId, taskId);
      } catch (e) {
        this.logger.error(e);
      }
    });
  }

  async enqueue(userId: number, projectId: number, taskEvent: TaskEvent) {
    const { taskId } = taskEvent;
    await this.validateUserRole(userId, projectId);
    const currentEvents = this.operations.get(taskId) || [];
    this.operations.set(taskId, [...currentEvents, { userId, taskEvent }]);
    this.eventEmitter.emit('operationAdded', projectId, taskId);
  }

  private async dequeue(projectId: number, taskId: number) {
    const taskEventQueue = this.operations.get(taskId);
    if (!taskEventQueue) {
      return;
    }

    const initialTask = await this.taskRepository.findOneBy({ id: taskId });
    let accumulateOperations = [];
    while (taskEventQueue.length) {
      const { userId, taskEvent } = taskEventQueue.shift();
      const operation = this.convertToOperation(userId, taskEvent);

      const transformedOperation = accumulateOperations.length
        ? json0.transform(operation, accumulateOperations, 'right')
        : operation;

      accumulateOperations = json0.compose(accumulateOperations, transformedOperation);
    }

    const newText = json0.apply(initialTask.title, accumulateOperations);
    const result = { ...initialTask, title: newText };
    await this.taskRepository.save(result);
    for (let i = 0; i < accumulateOperations.length; i += 1) {
      const operation = accumulateOperations[i];
      const content = operation.si ? operation.si : operation.sd;
      const position = operation.p[0];
      const eventType = operation.si ? EventType.TITLE_INSERTED : EventType.TITLE_DELETED;
      this.eventEmitter.emit(
        'event',
        operation.userId,
        projectId,
        new TaskEventResponse(
          eventType,
          new TitleUpdatedEvent(taskId, position, content, content.length)
        )
      );
    }
  }

  private convertToOperation(userId: number, taskEvent: TaskEvent) {
    const { event } = taskEvent;
    const { content, position } = taskEvent.title;

    switch (event) {
      case EventType.INSERT_TITLE:
        return [{ userId, p: [position], si: content }];
      case EventType.DELETE_TITLE:
        return [{ userId, p: [position], sd: content }];
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

    this.eventEmitter.emit(
      'event',
      userId,
      projectId,
      new TaskEventResponse(EventType.TASK_CREATED, new TaskCreatedEvent(task))
    );
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
    const taskIds = tasks.map((task) => task.id);

    const subTasks =
      taskIds.length === 0
        ? []
        : await this.subTaskRepository.find({ where: { taskId: In(taskIds) } });
    const taskAssigneeRecords = await this.findTaskAssigneeRecordsByProject(projectId);
    const labelRecords = await this.findTaskLabelRecordsByProject(projectId);

    const subTaskStatistics = subTasks.reduce(
      (acc, subTask) => {
        if (!acc[subTask.taskId]) {
          acc[subTask.taskId] = { total: 0, completed: 0 };
        }
        if (subTask.status === SubTaskStatus.COMPLETED) {
          acc[subTask.taskId].completed += 1;
        }
        acc[subTask.taskId].total += 1;
        return acc;
      },
      {} as Record<number, { total: number; completed: number }>
    );

    const assigneesByTaskId = taskAssigneeRecords.reduce(
      (acc, record) => {
        if (!acc[record.taskId]) {
          acc[record.taskId] = [];
        }
        acc[record.taskId].push(
          new AssigneeDetailsResponse(record.id, record.username, record.profileImage)
        );
        return acc;
      },
      {} as Record<number, AssigneeDetailsResponse[]>
    );

    const labelsByTaskId = labelRecords.reduce(
      (acc, record) => {
        if (!acc[record.taskId]) {
          acc[record.taskId] = [];
        }
        acc[record.taskId].push(new LabelDetailsResponse(record as Label));
        return acc;
      },
      {} as Record<number, LabelDetailsResponse[]>
    );

    const taskBySection = sections.map((section) => ({
      id: section.id,
      name: section.name,
      tasks: tasks
        .filter((task) => task.section.id === section.id)
        .map((task) => {
          const subtasks = subTaskStatistics[task.id] || { total: 0, completed: 0 };
          const assignees = assigneesByTaskId[task.id] || [];
          const labels = labelsByTaskId[task.id] || [];
          return new TaskResponse(task, assignees, labels, subtasks);
        }),
    }));
    const now = new Date();
    return { version: now.getTime(), project: taskBySection };
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
      'event',
      userId,
      projectId,
      new TaskEventResponse(EventType.POSITION_UPDATED, new PositionUpdatedEvent(task))
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
    const subTasks = await this.subTaskRepository.findBy({ taskId });
    const taskAssigneeRecords = await this.findTaskAssigneeRecordsByTask(taskId);
    const labels = await this.findTaskLabelsByTask(taskId);
    return new TaskResponse(
      task,
      taskAssigneeRecords.map(
        (record) => new AssigneeDetailsResponse(record.id, record.username, record.profileImage)
      ),
      labels.map((label) => new LabelDetailsResponse(label)),
      {
        total: subTasks.length,
        completed: subTasks.filter((subTask) => subTask.status === SubTaskStatus.COMPLETED).length,
      }
    );
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
    const taskId = task.id;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
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
      'event',
      userId,
      projectId,
      new TaskEventResponse(EventType.TASK_DELETED, new TaskDeletedEvent(taskId))
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
    const labelsResponse = labels.map((label) => new LabelDetailsResponse(label));
    this.eventEmitter.emit(
      'event',
      userId,
      projectId,
      new TaskEventResponse(
        EventType.LABELS_CHANGED,
        new LabelsChangedEvent(taskId, labelsResponse)
      )
    );
    return { taskId, labels: labelsResponse };
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
        .select(['c.userId AS userId, a.username AS username, a.profileImage AS profileImage'])
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
    const assigneesResponse = records.map(
      (record) => new AssigneeDetailsResponse(record.userId, record.username, record.profileImage)
    );
    this.eventEmitter.emit(
      'event',
      userId,
      projectId,
      new TaskEventResponse(
        EventType.ASSIGNEES_CHANGED,
        new AssigneesChangedEvent(taskId, assigneesResponse)
      )
    );
    return { taskId, assignees: assigneesResponse };
  }

  async getTaskDetail(userId: number, taskId: number) {
    const task = await this.findTaskOrThrow(taskId);
    await this.validateUserRole(userId, task.section.project.id);

    const result = new TaskDetailsResponse(task);
    const sprint = task.sprintId
      ? await this.sprintRepository.findOneBy({ id: task.sprintId })
      : null;
    result.setSprint(sprint ? new SprintDetailsResponse(sprint) : null);

    const taskAssigneeRecords = await this.findTaskAssigneeRecordsByTask(taskId);
    result.setAssignees(
      taskAssigneeRecords.map(
        (record) => new AssigneeDetailsResponse(record.id, record.username, record.profileImage)
      )
    );

    const labels = await this.findTaskLabelsByTask(taskId);
    result.setLabels(labels.map((label) => new LabelDetailsResponse(label)));

    const subTasks = await this.subTaskRepository.findBy({ taskId });
    result.setSubtasks(subTasks.map((subTask) => new CreateSubTaskResponse(subTask)));
    return result;
  }

  async getWorkload(userId: number, projectId: number) {
    await this.validateUserRole(userId, projectId);
    const contributorRecord = await this.contributorRepository
      .createQueryBuilder('c')
      .leftJoin('task_assignee', 'ta', 'c.userId = ta.accountId and ta.projectId = :projectId', {
        projectId,
      })
      .leftJoin('account', 'a', 'c.userId = a.id')
      .where('(c.projectId = :projectId AND c.status = :status)', {
        projectId,
        status: ContributorStatus.ACCEPTED,
      })
      .select([
        'c.userId AS id',
        'a.username AS username',
        'a.profileImage AS profileImage',
        'COUNT(ta.id) AS count',
      ])
      .groupBy('c.userId')
      .orderBy('count', 'DESC')
      .getRawMany();
    const users = contributorRecord.map((contributor) => ({
      ...contributor,
      count: parseInt(contributor.count, 10),
    }));
    const totalTasks = users.reduce((sum, contributor) => sum + contributor.count, 0);
    return { totalTasks, users };
  }

  async getOverview(userId: number, projectId: number) {
    await this.validateUserRole(userId, projectId);
    const sectionRecords = await this.sectionRepository
      .createQueryBuilder('s')
      .leftJoin('task', 't', 's.id = t.section_id')
      .leftJoin('project', 'p', 's.project_id = p.id')
      .where('p.id = :projectId', { projectId })
      .select(['s.id AS id', 's.name AS title', 'COUNT(t.id) AS count'])
      .groupBy('s.id')
      .getRawMany();
    const sections = sectionRecords.map((section) => ({
      ...section,
      count: parseInt(section.count, 10),
    }));
    const totalTasks = sections.reduce((sum, section) => sum + section.count, 0);
    return { totalTasks, sections };
  }

  async getPriority(userId: number, projectId: number) {
    await this.validateUserRole(userId, projectId);
    const tasks = await this.taskRepository
      .createQueryBuilder('t')
      .leftJoin('section', 's', 't.section_id = s.id')
      .leftJoin('project', 'p', 's.project_id = p.id')
      .where('p.id = :projectId', { projectId })
      .getMany();

    const result = tasks.reduce(
      (acc, task) => {
        const key = task.priority ? task.priority : 0;
        if (!acc[key]) {
          acc[key] = 0;
        }
        acc[key] += 1;
        return acc;
      },
      {} as Record<number, number>
    );
    const response = [];
    const keyMapper = ['None', 'Lowest', 'Low', 'Medium', 'High', 'Highest'];
    for (let i = 0; i <= 5; i += 1) {
      response.push({ priority: keyMapper[i], count: result[i] ? result[i] : 0 });
    }
    return response;
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

  private async findTaskLabelsByTask(taskId: number) {
    return this.labelRepository
      .createQueryBuilder('l')
      .leftJoin('task_label', 'tl', 'l.id = tl.labelId')
      .where('tl.taskId = :taskId', { taskId })
      .getMany();
  }

  private async findTaskAssigneeRecordsByTask(taskId: number) {
    return this.taskAssigneeRepository
      .createQueryBuilder('ta')
      .leftJoin('account', 'a', 'ta.accountId = a.id')
      .where('ta.taskId = :taskId', { taskId })
      .select(['ta.accountId AS id', 'a.username AS username', 'a.profileImage AS profileImage'])
      .getRawMany();
  }

  private async findTaskLabelRecordsByProject(projectId: number) {
    return this.taskLabelRepository
      .createQueryBuilder('tl')
      .leftJoin('label', 'l', 'tl.labelId = l.id')
      .where('tl.projectId = :projectId', { projectId })
      .select([
        'tl.taskId AS taskId',
        'l.id AS id',
        'l.title AS title',
        'l.description AS description',
        'l.color AS color',
      ])
      .getRawMany();
  }

  private async findTaskAssigneeRecordsByProject(projectId: number) {
    return this.taskAssigneeRepository
      .createQueryBuilder('ta')
      .leftJoin('account', 'a', 'ta.accountId = a.id')
      .where('ta.projectId = :projectId', { projectId })
      .select([
        'ta.taskId AS taskId',
        'ta.accountId AS id',
        'a.username AS username',
        'a.profileImage AS profileImage',
      ])
      .getRawMany();
  }
}
