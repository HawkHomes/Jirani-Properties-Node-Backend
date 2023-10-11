import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { roleInterface } from '../types';
import { User } from './User';

@Entity({ name: 'perm' })
export class Perm {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({
		enum: roleInterface,
		nullable: false,
		type: 'enum',
		name: 'role',
	})
	role: roleInterface;

	@OneToMany(() => User, (user) => user.perm)
	user: User;
}
