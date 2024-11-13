import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskController } from './controller/task.controller';
import { TaskService } from './service/task.service';
import { Task } from './domain/task.entity';
import { Section } from './domain/section.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Task, Section])],
  controllers: [TaskController],
  providers: [TaskService],
})
export class TaskModule {}
