import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskController } from '@/task/controller/task.controller';
import { TaskService } from '@/task/service/task.service';
import { Task } from '@/task/domain/task.entity';
import { Section } from '@/task/domain/section.entity';
import { Project } from '@/project/entity/project.entity';
import { SnapshotController } from '@/task/controller/snapshot.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Task, Section, Project])],
  controllers: [TaskController, SnapshotController],
  providers: [TaskService],
  exports: [TaskService],
})
export class TaskModule {}
