import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigModule } from '@nestjs/config';
import { TaskModule } from './task/task.module';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { TypeormConfig } from '../config/typeorm.config';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { HttpLoggingInterceptor } from './common/httpLog.Interceptor';
import { AllExceptionsFilter } from './common/allException.filter';

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
	],
})
export class AppModule {}
