import { CreateDateColumn, Column, Entity, OneToMany } from 'typeorm';

import { BaseClass } from './AbstractEntities';
import { House } from './House';

@Entity({ name: 'categories' })
export class Category extends BaseClass {
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
