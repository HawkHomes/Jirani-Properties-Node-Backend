import { User } from './User';

import {
	PrimaryGeneratedColumn,
	OneToOne,
	JoinColumn,
	Column,
	Entity,
} from 'typeorm';

@Entity({ name: 'activation' })
export class ActivateAccount {
	@PrimaryGeneratedColumn('uuid')
	id: string;

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
