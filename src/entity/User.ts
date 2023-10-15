import {
	DeleteDateColumn,
	CreateDateColumn,
	ManyToOne,
	OneToMany,
	JoinColumn,
	OneToOne,
	Entity,
	Column,
} from 'typeorm';

import { OauthEntityClass } from './AbstractEntities';
import { PasswordReset } from './PasswordReset';
import { ActivateAccount } from './Activate';
import { Property } from './Property';
import { Review } from './Review';
import { Agency } from './Agency';
import { Profile } from './Profile';
import { Perm } from './Perm';

@Entity({ name: 'users' })
export class User extends OauthEntityClass {
	// @PrimaryGeneratedColumn('uuid')
	// uid: string;

	@Column({ nullable: false })
	first_name: string;

	@Column({ nullable: false })
	last_name: string;

	@Column({ nullable: false, default: false })
	active: boolean;

	@Column({ nullable: false, default: false })
	disabled: boolean;

	@Column({ nullable: false, default: false })
	verified: boolean;

	@Column({ nullable: true, select: false })
	password: string;

	@CreateDateColumn({ name: 'date_created', nullable: false })
	date_added: Date;

	@Column({
		name: 'refToken',
		nullable: true,
		select: false,
		default: null,
		type: 'text',
	})
	refToken: string;

	@ManyToOne(() => Perm, (perm) => perm.user, {
		nullable: false,
		lazy: true,
	})
	@JoinColumn({ name: 'perm' })
	perm: Perm;

	@OneToOne(() => Profile, (profile) => profile.user, {
		orphanedRowAction: 'delete',
		onDelete: 'CASCADE',
		cascade: true,
		nullable: false,
		eager: true,
	})
	@JoinColumn({ name: 'profile' })
	profile: Profile;

	@DeleteDateColumn({ name: 'date_deleted', select: false, nullable: true })
	date_deleted: Date;

	@OneToOne(() => ActivateAccount, (accUser) => accUser.user, {
		cascade: true,
	})
	acc_user: ActivateAccount;

	@OneToOne(() => PasswordReset, (passReset) => passReset.user, {
		// cascade: true,
		orphanedRowAction: 'delete',
		onDelete: 'CASCADE',
	})
	pass_reset: PasswordReset;

	@OneToMany(() => Property, (property) => property.owner, {
		cascade: true,
	})
	properties: Property[];

	@ManyToOne(() => Agency, (agency) => agency.users, {
		nullable: true,
		eager: false,
	})
	@JoinColumn({ name: 'agency' })
	agency: Agency;

	@OneToMany(() => Review, (review) => review.owner, { lazy: true })
	review: Review[];
}
