import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskController } from '@/task/controller/task.controller';
import { TaskService } from '@/task/service/task.service';
import { Task } from '@/task/domain/task.entity';
import { Section } from '@/task/domain/section.entity';
import { Project } from '@/project/entity/project.entity';
import { EventController } from '@/task/controller/event.controller';
import { BroadcastService } from '@/task/service/broadcast.service';
import { Contributor } from '@/project/entity/contributor.entity';
import { SubTask } from '@/task/domain/subTask.entity';
import { SubTaskService } from '@/task/service/subTask.service';
import { SubTaskController } from '@/task/controller/subTask.controller';
import { Sprint } from '@/project/entity/sprint.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Task, Section, Project, Contributor, SubTask, Sprint])],
  controllers: [TaskController, EventController, SubTaskController],
  providers: [TaskService, BroadcastService, SubTaskService],
  exports: [TaskService],
})
export class TaskModule {}
