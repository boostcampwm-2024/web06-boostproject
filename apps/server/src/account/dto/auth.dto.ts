import { Account } from '@/account/entity/account.entity';

export class AuthDto {
  id: number;

  username: string;

  profileImage: string;

  accessToken: string;

  static of(accessToken: string, user: Account) {
    const response = new AuthDto();
    response.id = user.id;
    response.username = user.username;
    response.profileImage = user.profileImage;
    response.accessToken = accessToken;
    return response;
  }
}
