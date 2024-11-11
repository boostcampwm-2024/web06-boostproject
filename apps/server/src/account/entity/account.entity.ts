import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Account {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	username: string;

	@Column()
	password: string;

	@Column({ nullable: true })
	refreshToken: string;

	setRefreshToken(refreshToken: string | null) {
		this.refreshToken = refreshToken;
	}
}
