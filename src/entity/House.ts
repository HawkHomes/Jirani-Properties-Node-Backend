import {
	PrimaryGeneratedColumn,
	UpdateDateColumn,
	CreateDateColumn,
	ManyToMany,
	ManyToOne,
	JoinColumn,
	JoinTable,
	Column,
	Entity,
	DeleteDateColumn,
} from 'typeorm';

import { Category } from './Category';
import { Property } from './Property';
import { Feature } from './Feature';

@Entity({ name: 'house' })
export class House {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ name: 'price' })
	cost: number;

	@Column({ name: 'for_sale' })
	for_sale: boolean;

	@Column({ name: 'total_available' })
	total_available: number;

	@Column({ name: 'additional', type: 'text', default: null })
	additional_info: string;

	@CreateDateColumn({ name: 'date_added' })
	date_added: Date;

	@UpdateDateColumn({ name: 'date_updated' })
	date_updated: Date;

	@DeleteDateColumn({ name: 'date_deleted', select: false })
	date_deleted: Date;

	@ManyToMany((type) => Feature, (feature) => feature.house, {
		nullable: false,
		eager: true,
	})
	@JoinTable({ name: 'HouseFeature' })
	features: Feature[];

	@Column('text', { name: 'photos', nullable: false, array: true })
	photos: string[];

	@ManyToOne((type) => Category, (category) => category.houses, {
		nullable: false,
		eager: true,
	})
	@JoinColumn({ name: 'category' })
	category: Category;

	@ManyToOne((type) => Property, (property) => property.houses, {
		nullable: false,
		eager: true,
	})
	@JoinColumn({ name: 'property' })
	property: Property;
}
