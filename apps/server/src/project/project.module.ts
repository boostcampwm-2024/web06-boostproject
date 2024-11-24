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
import { Sprint } from '@/project/entity/sprint.entity';
import { SprintController } from '@/project/controller/sprint.controller';
import { SprintService } from '@/project/service/sprint.service';
import { TaskLabel } from '@/task/domain/task-label.entity';
import { LabelController } from '@/project/controller/label.controller';
import { LabelService } from '@/project/service/label.service';
import { Label } from '@/project/entity/label.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Project,
      Contributor,
      Account,
      Task,
      Section,
      Sprint,
      Label,
      TaskLabel,
    ]),
    TaskModule,
  ],
  controllers: [ProjectController, ProjectsController, SprintController, LabelController],
  providers: [ProjectService, SprintService, LabelService],
})
export class ProjectModule {}
