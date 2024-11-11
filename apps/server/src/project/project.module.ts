import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectService } from './service/project.service';
import { ProjectController } from './controller/project.controller';
import { Project } from './entity/project.entity';
import { Contributor } from './entity/contributor.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Project, Contributor])],
	controllers: [ProjectController],
	providers: [ProjectService],
})
export class ProjectModule {}
