import { OneToMany } from 'typeorm';
import { House } from './House';

import {
	PrimaryGeneratedColumn,
	CreateDateColumn,
	Column,
	Entity,
} from 'typeorm';

@Entity({ name: 'categories' })
export class Category {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ name: 'category', nullable: false, unique: true })
	name: string;

	@CreateDateColumn({ name: 'added_on', nullable: false, select: false })
	added_on: Date;

	@OneToMany((type) => House, (house) => house.category, {
		nullable: false,
		lazy: true,
	})
	houses: House[];
}
