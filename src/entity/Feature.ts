import {
	PrimaryGeneratedColumn,
	ManyToMany,
	JoinColumn,
	Column,
	Entity,
} from 'typeorm';

import { Property } from './Property';
import { House } from './House';

@Entity({ name: 'Features' })
export class Feature {
	@PrimaryGeneratedColumn('uuid')
	id: string;

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
