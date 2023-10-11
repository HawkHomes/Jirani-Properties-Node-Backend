import {
	Column,
	DeleteDateColumn,
	Entity,
	OneToMany,
	PrimaryGeneratedColumn,
} from 'typeorm';

import { Property } from './Property';

@Entity({ name: 'PropertyType' })
export class PropertyType {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ name: 'type', nullable: false })
	name: string;

	@DeleteDateColumn({ name: 'date_deleted', select: false, nullable: true })
	date_deleted: Date;

	@OneToMany(() => Property, (property) => property.type, {
		onDelete: 'CASCADE',
		cascade: true,
		nullable: false,
	})
	property: Property[];
}
