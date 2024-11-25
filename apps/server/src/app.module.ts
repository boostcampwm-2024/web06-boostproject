import { Module, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TaskModule } from '@/task/task.module';
import { TypeormConfig } from '../config/typeorm.config';
import { AppService } from '@/app.service';
import { AppController } from '@/app.controller';
import { ResponseInterceptor } from './common/interceptor/response.interceptor';
import { HttpLoggingInterceptor } from '@/common/interceptor/httpLog.Interceptor';
import { AllExceptionsFilter } from '@/common/allException.filter';
import { AccountModule } from '@/account/account.module';
import { ProjectModule } from '@/project/project.module';
import { PlanningPokerModule } from './planning-poker/planning-poker.module';

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
    EventEmitterModule.forRoot(),
    TaskModule,
    AccountModule,
    ProjectModule,
    PlanningPokerModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
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
        transform: true,
      }),
    },
  ],
})
export class AppModule {}
