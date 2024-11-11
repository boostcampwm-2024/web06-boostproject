import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectService } from './service/project.service';
import { ProjectController } from './controller/project.controller';
import { Project } from './entity/project.entity';
import { Contributor } from './entity/contributor.entity';
import { Account } from '@/account/entity/account.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Project, Contributor, Account])],
	controllers: [ProjectController],
	providers: [ProjectService],
})
export class ProjectModule {}
