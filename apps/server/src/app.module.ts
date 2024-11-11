import { Module, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { TaskModule } from './task/task.module';
import { TypeormConfig } from '../config/typeorm.config';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { HttpLoggingInterceptor } from './common/httpLog.Interceptor';
import { AllExceptionsFilter } from './common/allException.filter';
import { AccountModule } from './account/account.module';
import { ProjectModule } from './project/project.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		TypeOrmModule.forRootAsync({
			useClass: TypeormConfig,
			dataSourceFactory: async (options: DataSourceOptions) => {
				return new DataSource(options).initialize();
			},
		}),
		TaskModule,
		AccountModule,
		ProjectModule,
	],
	controllers: [AppController],
	providers: [
		AppService,
		{
			provide: APP_INTERCEPTOR,
			useClass: HttpLoggingInterceptor,
		},
		{
			provide: APP_FILTER,
			useClass: AllExceptionsFilter,
		},
		{
			provide: APP_PIPE,
			useValue: new ValidationPipe({
				whitelist: true,
			}),
		},
	],
})
export class AppModule {}
