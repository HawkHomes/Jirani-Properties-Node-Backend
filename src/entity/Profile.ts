import {
	Column,
	DeleteDateColumn,
	Entity,
	OneToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from './User';

@Entity({ name: 'Profile' })
export class Profile {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ name: 'avatar', nullable: true })
	avatar: string;

	@Column({ name: 'email_addr', unique: true })
	email_addr: string;

	@Column({ name: 'phone', nullable: false })
	phone: string;

	@Column({ name: 'id_no', nullable: true })
	id_no: number;

	@Column({ name: 'kra_pin', nullable: true })
	kra_pin: string;

	@DeleteDateColumn({ name: 'date_deleted', select: false, nullable: true })
	date_deleted: Date;

	@OneToOne(() => User, (user) => user.profile)
	user: User;
}
