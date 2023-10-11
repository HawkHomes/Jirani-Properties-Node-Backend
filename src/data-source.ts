import { DataSource } from 'typeorm';
import 'reflect-metadata';

// 3d mods
import { PasswordResetSubscriber } from './subscribers/password-reset';
import { PasswordReset } from './entity/PasswordReset';
import { PropertyType } from './entity/PropertyType';
import { ActivateAccount } from './entity/Activate';
import { Category } from './entity/Category';
import { Property } from './entity/Property';
import { Feature } from './entity/Feature';
import { Review } from './entity/Review';
import { Agency } from './entity/Agency';
import { Profile } from './entity/Profile';
import { House } from './entity/House';
import { Perm } from './entity/Perm';
import { User } from './entity/User';
import { UserSub } from './subscribers/user';

export const AppDataSource = new DataSource({
	port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
	database: process.env.DB_NAME ? process.env.DB_NAME : 'hawk_',
	password: process.env.DB_USER_PASS ?? '8H3S;k}E*H?m',
	username: process.env.DB_USER ?? 'postgres',
	host: process.env.DB_HOST ?? 'localhost',
	entities: [
		ActivateAccount,
		PasswordReset,
		PropertyType,
		Category,
		Property,
		Agency,
		Feature,
		Review,
		Profile,
		House,
		Perm,
		User,
	],
	subscribers: [UserSub, PasswordResetSubscriber],
	// logNotifications: true,
	synchronize: true,
	type: 'postgres',
	migrations: [],
	logging: false,
	logger: 'file',
});
