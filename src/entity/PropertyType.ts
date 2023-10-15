import { Column, DeleteDateColumn, Entity, OneToMany } from 'typeorm';

import { BaseClass } from './AbstractEntities';
import { Property } from './Property';

@Entity({ name: 'propertyTypes' })
export class PropertyType extends BaseClass {
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
