import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectService } from './service/project.service';
import { ProjectController } from './controller/project.controller';
import { Project } from './entity/project.entity';
import { Contributor } from './entity/contributor.entity';
import { Account } from '@/account/entity/account.entity';
import { Task } from '@/task/domain/task.entity';
import { ProjectsController } from '@/project/controller/projects.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Project, Contributor, Account, Task])],
  controllers: [ProjectController, ProjectsController],
  providers: [ProjectService],
})
export class ProjectModule {}
