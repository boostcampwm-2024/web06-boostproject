import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from '@/account/entity/account.entity';

@Injectable()
export class AccountService {
  constructor(@InjectRepository(Account) private accountRepository: Repository<Account>) {}

  findByUsername(username: string) {
    return this.accountRepository.findOneBy({ username });
  }

  findById(id: number) {
    return this.accountRepository.findOneBy({ id });
  }

  async create(username: string, password: string) {
    const user = this.accountRepository.create({ username, password });
    return this.accountRepository.save(user);
  }

  async setRefreshToken(user: Account, hashRefreshToken: string | null) {
    user.setRefreshToken(hashRefreshToken);
    await this.accountRepository.save(user);
  }
}
