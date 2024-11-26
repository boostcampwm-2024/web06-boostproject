import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from './entity/account.entity';

@Injectable()
export class UserService {
  constructor(@InjectRepository(Account) private userRepository: Repository<Account>) {}

  async getOne(id: number) {
    return this.userRepository.findOneBy({ id });
  }
}
