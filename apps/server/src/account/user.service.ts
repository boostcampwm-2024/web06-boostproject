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

  async updateProfileImage(id: number, profileImage: string) {
    const user = await this.userRepository.findOneBy({ id });
    user.profileImage = profileImage;
    return this.userRepository.save(user);
  }
}
