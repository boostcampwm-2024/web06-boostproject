import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskController } from './controller/task.controller';
import { TaskService } from './service/task.service';
import { Task } from './domain/task.entity';
import { Section } from './domain/section.entity';
import { Project } from '@/project/entity/project.entity';
import { SnapshotController } from './controller/snapshot.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Task, Section, Project])],
  controllers: [TaskController, SnapshotController],
  providers: [TaskService],
})
export class TaskModule {}
