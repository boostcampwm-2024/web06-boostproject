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

@Module({
  imports: [TypeOrmModule.forFeature([Task, Section, Project, Contributor])],
  controllers: [TaskController, EventController],
  providers: [TaskService, BroadcastService],
  exports: [TaskService],
})
export class TaskModule {}
