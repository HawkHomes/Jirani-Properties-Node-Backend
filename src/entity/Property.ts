import {
	PrimaryGeneratedColumn,
	ManyToMany,
	ManyToOne,
	OneToMany,
	JoinColumn,
	JoinTable,
	Index,
	Column,
	Entity,
	Point,
	DeleteDateColumn,
} from 'typeorm';

import { PropertyType } from './PropertyType';
import { Feature } from './Feature';
import { Review } from './Review';
import { Agency } from './Agency';
import { House } from './House';
import { User } from './User';

@Entity({ name: 'Properties' })
export class Property {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ name: 'name' })
	name: string;

	@Column({ name: 'address' })
	address: string;

	@Index({ spatial: true })
	@Column({ type: 'geometry', spatialFeatureType: 'Point', srid: 4326 })
	coords: Point;

	@Column({ name: 'nearest_town' })
	nearest_town: string;

	@Column({ name: 'land_size', nullable: true })
	land_size: number;

	@Column({ name: 'year_built', nullable: true })
	year_built: number;

	@Column('text', { name: 'photos', nullable: false, array: true })
	photos: string[];

	@ManyToOne(() => PropertyType, (propertyType) => propertyType.property, {
		cascade: false,
		nullable: false,
		eager: true,
	})
	@JoinColumn({ name: 'type' })
	type: PropertyType;

	@Column({ name: 'additional', type: 'text', default: null })
	additional_info: string;

	@DeleteDateColumn({ name: 'date_deleted', select: false, nullable: true })
	date_deleted: Date;

	@ManyToMany((type) => Feature, (feature) => feature.property, {
		nullable: false,
		eager: true,
	})
	@JoinTable({ name: 'PropertyFeature' })
	features: Feature[];

	@OneToMany((type) => Review, (review) => review.property, {
		cascade: true,
		eager: true,
	})
	review: Review[];

	@ManyToOne((type) => User, (user) => user.properties, {
		eager: true,
		nullable: false,
	})
	@JoinColumn({ name: 'owner' })
	owner: User;

	@OneToMany((type) => House, (house) => house.property, {
		cascade: true,
		nullable: false,
	})
	houses: House[];

	@ManyToOne(() => Agency, (agency) => agency.properties, {
		cascade: false,
		nullable: false,
		eager: true,
	})
	@JoinColumn({ name: 'agency' })
	agency: Agency;
}
