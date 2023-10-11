import { createHandler } from 'graphql-http/lib/use/express';
import { GraphQLError, GraphQLSchema } from 'graphql';
import { Express } from 'express';

import { GraphQlMiddlewareContent } from './utils/reusables';
import { API_PREFIX } from '../utils/constants';
import { RootQuery } from './schema';

export const rootGraphHandler = (app: Express) => {
	app.use(
		`${API_PREFIX}/graphql`,
		createHandler({
			schema: new GraphQLSchema({
				// mutation: RootMutation,
				query: RootQuery,
			}),
			context: GraphQlMiddlewareContent,
			formatError: (err: GraphQLError) => ({
				extensions: err?.extensions,
				message: err.message,
				name: err.name,
			}),
		})
	);
};
