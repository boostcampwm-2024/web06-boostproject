import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeormConfig } from '../config/typeorm.config';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { HttpLoggingInterceptor } from './common/httpLog.Interceptor';

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
	],
	controllers: [AppController],
	providers: [
		AppService,
		{
			provide: APP_INTERCEPTOR,
			useClass: HttpLoggingInterceptor,
		},
	],
})
export class AppModule {}
