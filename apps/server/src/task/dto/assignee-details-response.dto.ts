export class AssigneeDetailsResponse {
  constructor(id: number, username: string, avatar: string) {
    this.id = id;
    this.username = username;
    this.avatar = avatar;
  }

  id: number;

  username: string;

  avatar: string;
}
