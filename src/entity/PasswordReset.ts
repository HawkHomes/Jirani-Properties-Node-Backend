import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	OneToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from './User';

@Entity({ name: 'PasswordReset' })
export class PasswordReset {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ name: 'token', nullable: false })
	token: string;

	@CreateDateColumn({ name: 'time_created', nullable: false })
	create: Date;

	@OneToOne((type) => User, (user) => user.pass_reset, { nullable: false })
	@JoinColumn({ name: 'user' })
	user: User;
}
