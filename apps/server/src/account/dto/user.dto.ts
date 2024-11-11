import { Account } from '../entity/account.entity';

export class UserDto {
	id: number;

	username: string;

	constructor(account: Account) {
		this.id = account.id;
		this.username = account.username;
	}
}
