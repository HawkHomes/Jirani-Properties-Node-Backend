import { config as dotEnvConfig } from 'dotenv';

import { API_PREFIX } from './utils/constants';
import { AppDataSource } from './data-source';
import { rootGraphHandler } from './graphql';
import { userInterface } from './types';
import routerBase from './routes';
import {
	createDefaultAgency,
	createDefaultUser,
	createRoles,
} from './controllers/createRoles';
import app from './utils/app';
require('./cofigs/passport');

dotEnvConfig({
	path: __dirname + '/.env',
});

declare module 'express-serve-static-core' {
	interface Request {
		user?: Omit<userInterface, 'is_landlord'>;
		files?: any;
	}
}

AppDataSource.initialize()
	.then(async () => {
		// create roles
		createRoles();

		// create default agency
		createDefaultAgency();

		// attach graphql
		rootGraphHandler(app);

		// attach the root of all the routes
		routerBase(app);

		// create default user
		createDefaultUser();

		app.listen(process.env.SERVER_PORT || 4000, () =>
			console.log(
				`Server is running on  http://localhost:${
					process.env.SERVER_PORT || 4000
				}${API_PREFIX}/`
			)
		);
	})
	.catch((error) => console.log(`Error: ${error}`));
