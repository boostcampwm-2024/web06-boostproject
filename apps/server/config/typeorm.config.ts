import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { Task } from '@/project/entity/task.entity';
import { Section } from '@/project/entity/section.entity';
import { Account } from '@/account/entity/account.entity';
import { Project } from '@/project/entity/project.entity';
import { Contributor } from '@/project/entity/contributor.entity';
import { SubTask } from '@/project/entity/subTask.entity';
import { Sprint } from '@/project/entity/sprint.entity';
import { Label } from '@/project/entity/label.entity';
import { TaskLabel } from '@/project/entity/task-label.entity';
import { TaskAssignee } from '@/project/entity/task-assignee.entity';

@Injectable()
export class TypeormConfig implements TypeOrmOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'mysql',
      host: this.configService.get<string>('DATABASE_HOST'),
      port: this.configService.get<number>('DATABASE_PORT'),
      username: this.configService.get<string>('DATABASE_USER'),
      password: this.configService.get<string>('DATABASE_PASSWORD'),
      database: this.configService.get<string>('DATABASE_NAME'),
      entities: [
        Task,
        Section,
        Account,
        Project,
        Contributor,
        SubTask,
        Sprint,
        Label,
        TaskLabel,
        TaskAssignee,
      ],
      synchronize: true,
      ssl: {
        rejectUnauthorized: false,
      },
      logging: false,
    } as TypeOrmModuleOptions;
  }
}
