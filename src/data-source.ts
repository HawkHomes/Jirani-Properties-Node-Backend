import 'reflect-metadata';
import { DataSource } from 'typeorm';

// 3d mods
import { dirFileReader } from './utils/common';

export const AppDataSource = new DataSource({
	port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
	database: process.env.DB_NAME ? process.env.DB_NAME : 'hawk_',
	password: process.env.DB_USER_PASS ?? '8H3S;k}E*H?m',
	username: process.env.DB_USER ?? 'postgres',
	host: process.env.DB_HOST ?? 'localhost',
	entities: dirFileReader({
		ignoreFiles: [
			`${__dirname}/entity/AbstractEntities.ts`,
			`${__dirname}/entity/AbstractEntities.js`,
		],
		baseRoute: `${__dirname}/entity`,
		defaultExport: false,
		array: false,
	}),
	subscribers: dirFileReader({
		baseRoute: `${__dirname}/subscribers`,
		defaultExport: false,
		ignoreFiles: [],
		array: false,
	}),
	cache: process.env.NODE_ENV === 'production' ? true : false,
	// logNotifications: true,
	synchronize: true,
	type: 'postgres',
	migrations: [],
	logging: false,
	logger: 'file',
});
