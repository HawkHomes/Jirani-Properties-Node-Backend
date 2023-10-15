import {
	UpdateDateColumn,
	CreateDateColumn,
	OneToOne,
	JoinColumn,
	Column,
	Entity,
} from 'typeorm';

import { BaseClass } from './AbstractEntities';
import { User } from './User';

@Entity({ name: 'passwordReset' })
export class PasswordReset extends BaseClass {
	@Column({ name: 'token', nullable: false })
	token: string;

	@CreateDateColumn({ name: 'time_created', nullable: false })
	created: Date;

	@UpdateDateColumn({ name: 'updated', nullable: false })
	updated: Date;

	@OneToOne((type) => User, (user) => user.pass_reset, { nullable: false })
	@JoinColumn({ name: 'user' })
	user: User;
}
