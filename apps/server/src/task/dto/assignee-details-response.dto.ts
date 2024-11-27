export class AssigneeDetailsResponse {
  constructor(id: number, username: string, profileImage: string) {
    this.id = id;
    this.username = username;
    this.profileImage = profileImage;
  }

  id: number;

  username: string;

  profileImage: string;
}
