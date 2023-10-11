import {
	PrimaryGeneratedColumn,
	CreateDateColumn,
	ManyToOne,
	Column,
	Entity,
} from 'typeorm';

import { Property } from './Property';
import { User } from './User';

@Entity({ name: 'reviews' })
export class Review {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ name: 'review', type: 'text', nullable: true, default: null })
	review: string;

	@Column({ name: 'rating', type: 'text', default: null })
	rating: number;

	@CreateDateColumn({ name: 'date_created' })
	date_created: Date;

	@CreateDateColumn({ name: 'date_updated' })
	date_updated: Date;

	@ManyToOne((type) => User, (user) => user.review, {
		nullable: false,
		eager: false,
	})
	owner: User;

	@ManyToOne((type) => Property, (property) => property.review, {
		nullable: false,
		eager: false,
		lazy: false,
	})
	property: Property;
}
