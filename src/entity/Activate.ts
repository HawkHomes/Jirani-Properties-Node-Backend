import { OneToOne, JoinColumn, Column, Entity } from 'typeorm';

import { BaseClass } from './AbstractEntities';
import { User } from './User';

@Entity({ name: 'activation' })
export class ActivateAccount extends BaseClass {
	@Column({ name: 'otp' })
	otp: number;

	@OneToOne(() => User, (user) => user.acc_user, {
		onDelete: 'CASCADE',
		nullable: false,
		eager: true,
	})
	@JoinColumn({ name: 'user_id' })
	user: User;
}
