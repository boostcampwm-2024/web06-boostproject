import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectService } from '@/project/service/project.service';
import { ProjectController } from '@/project/controller/project.controller';
import { Project } from '@/project/entity/project.entity';
import { Contributor } from '@/project/entity/contributor.entity';
import { Account } from '@/account/entity/account.entity';
import { Task } from '@/task/domain/task.entity';
import { ProjectsController } from '@/project/controller/projects.controller';
import { Section } from '@/task/domain/section.entity';
import { TaskModule } from '@/task/task.module';

@Module({
  imports: [TypeOrmModule.forFeature([Project, Contributor, Account, Task, Section]), TaskModule],
  controllers: [ProjectController, ProjectsController],
  providers: [ProjectService],
})
export class ProjectModule {}
