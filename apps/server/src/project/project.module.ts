import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectService } from '@/project/service/project.service';
import { ProjectController } from '@/project/controller/project.controller';
import { Project } from '@/project/entity/project.entity';
import { Contributor } from '@/project/entity/contributor.entity';
import { Account } from '@/account/entity/account.entity';
import { Task } from '@/project/entity/task.entity';
import { ProjectsController } from '@/project/controller/projects.controller';
import { Section } from '@/project/entity/section.entity';
import { Sprint } from '@/project/entity/sprint.entity';
import { SprintController } from '@/project/controller/sprint.controller';
import { SprintService } from '@/project/service/sprint.service';
import { TaskLabel } from '@/project/entity/task-label.entity';
import { LabelController } from '@/project/controller/label.controller';
import { LabelService } from '@/project/service/label.service';
import { Label } from '@/project/entity/label.entity';
import { TaskController } from '@/project/controller/task.controller';
import { EventController } from '@/project/controller/event.controller';
import { SubTaskController } from '@/project/controller/subTask.controller';
import { TaskService } from '@/project/service/task.service';
import { BroadcastService } from '@/project/service/broadcast.service';
import { SubTaskService } from '@/project/service/subTask.service';
import { TaskAssignee } from '@/project/entity/task-assignee.entity';
import { SubTask } from '@/project/entity/subTask.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Project,
      Contributor,
      Account,
      Task,
      SubTask,
      Section,
      Sprint,
      Label,
      TaskLabel,
      TaskAssignee,
    ]),
  ],
  controllers: [
    ProjectController,
    ProjectsController,
    SprintController,
    LabelController,
    TaskController,
    EventController,
    SubTaskController,
  ],
  providers: [
    ProjectService,
    SprintService,
    LabelService,
    TaskService,
    BroadcastService,
    SubTaskService,
  ],
})
export class ProjectModule {}
