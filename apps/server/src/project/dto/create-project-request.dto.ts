import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateProjectRequest {
	@IsNotEmpty()
	@IsString()
	@Length(1, 20)
	title: string;
}
