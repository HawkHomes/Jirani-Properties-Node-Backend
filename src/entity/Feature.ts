import { ManyToMany, JoinColumn, Column, Entity } from 'typeorm';

import { BaseClass } from './AbstractEntities';
import { Property } from './Property';
import { House } from './House';

@Entity({ name: 'features' })
export class Feature extends BaseClass {
	@Column({ nullable: true, unique: true })
	name: string;

	@ManyToMany((type) => House, (house) => house.features, { nullable: true })
	house: House[];

	@ManyToMany((type) => Property, (property) => property.features, {
		nullable: true,
	})
	@JoinColumn({ name: 'propertyId' })
	property: Property[];
}
