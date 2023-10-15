import {
	CreateDateColumn,
	UpdateDateColumn,
	OneToMany,
	Column,
	Entity,
	DeleteDateColumn,
} from 'typeorm';

import { LocationEntity } from './AbstractEntities';
import { Property } from './Property';
import { User } from './User';

@Entity({ name: 'agencies' })
export class Agency extends LocationEntity {
	@Column({ name: 'name', nullable: false, unique: true })
	name: string;

	@Column({ name: 'address', nullable: false, unique: false })
	address: string;

	@Column({ name: 'phone', nullable: false, unique: false })
	phone: string;

	@Column({ name: 'avatar', nullable: true, default: '' })
	avatar: string;

	@Column({ name: 'website_url', nullable: false, unique: false })
	website_url: string;

	@Column({ name: 'licence', nullable: false, unique: false })
	licence: string;

	@DeleteDateColumn({ name: 'date_deleted', select: false })
	date_deleted: Date;

	@OneToMany(() => User, (user) => user, {
		nullable: true,
		eager: true,
	})
	users: User[];

	@OneToMany(() => Property, (property) => property.agency, {
		onDelete: 'CASCADE',
		cascade: true,
	})
	properties: Property[];

	@CreateDateColumn({ name: 'date_added' })
	date_added: Date;

	@UpdateDateColumn({ name: 'date_updated' })
	date_updated: Date;
}
