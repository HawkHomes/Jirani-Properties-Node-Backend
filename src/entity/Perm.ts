import { Column, Entity, OneToMany } from 'typeorm';

import { BaseClass } from './AbstractEntities';
import { roleInterface } from '../types';
import { User } from './User';

@Entity({ name: 'perm' })
export class Perm extends BaseClass {
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
