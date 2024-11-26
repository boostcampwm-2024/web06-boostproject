import { Account } from '@/account/entity/account.entity';

export class UserDto {
  id: number;

  username: string;

  profieImage: string;

  constructor(account: Account) {
    this.id = account.id;
    this.username = account.username;
    this.profieImage = account.profileImage;
  }
}
