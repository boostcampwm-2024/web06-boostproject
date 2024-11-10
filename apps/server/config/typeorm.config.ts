import { Section } from '@/task/domain/section.entity';
import { Task } from '@/task/domain/task.entity';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { Account } from '@/account/entity/account.entity';

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
				Account
			],
			synchronize: true,
			ssl: {
				rejectUnauthorized: false,
			},
			logging: true,
		} as TypeOrmModuleOptions;
	}
}
