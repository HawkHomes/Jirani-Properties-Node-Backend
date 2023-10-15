import {
	GraphQLObjectType,
	GraphQLNonNull,
	GraphQLList,
	GraphQLID,
} from 'graphql';

import {
	IdTypeGenericArray,
	BasePropertyFilters,
	StringTypeGeneric,
	IdTypeGeneric,
	PageLimitFilter,
	PropertyType,
	MinMaxFilter,
	Property,
	Category,
	Agency,
	Feature,
	House,
	User,
	statusTypeGeneric,
} from './types';
import {
	getPropertyTypesResolver,
	getPropertyTypeResolver,
	getCategoriesResolver,
	getPropertiesResolver,
	getCategoryResolver,
	getAgenciesResolver,
	getPropertyResolver,
	getFeaturesResolver,
	getFeatureResolver,
	getAgencyResolver,
	getHousesResolver,
	getHouseResolver,
	getUsersResolver,
	getUserResolver,
} from '../resolvers';

export const RootQuery = new GraphQLObjectType({
	name: 'RootQueryType',
	fields: () => ({
		users: {
			args: {
				phone: StringTypeGeneric,
				id: IdTypeGeneric,
				...PageLimitFilter,
			},
			type: new GraphQLList(User),
			resolve: getUsersResolver,
		},
		user: {
			type: User,
			args: {
				id: { type: new GraphQLNonNull(GraphQLID) },
			},
			resolve: getUserResolver,
		},
		houses: {
			args: {
				category: IdTypeGenericArray,
				cost: { type: MinMaxFilter },
				pid: IdTypeGeneric,
				id: IdTypeGeneric,

				...BasePropertyFilters,
				...PageLimitFilter,
			},
			type: new GraphQLList(House),
			resolve: getHousesResolver,
		},
		house: {
			type: House,
			args: {
				id: { type: new GraphQLNonNull(GraphQLID) },
			},
			resolve: getHouseResolver,
		},
		properties: {
			args: {
				...BasePropertyFilters,
				id: IdTypeGeneric,
				...PageLimitFilter,
			},

			type: new GraphQLList(Property),
			resolve: getPropertiesResolver,
		},
		property: {
			type: Property,
			args: {
				id: { type: new GraphQLNonNull(GraphQLID) },
			},
			resolve: getPropertyResolver,
		},
		categories: {
			args: {
				name: StringTypeGeneric,
				...PageLimitFilter,
				id: IdTypeGeneric,
			},
			type: new GraphQLList(Category),
			resolve: getCategoriesResolver,
		},
		category: {
			type: Category,
			args: {
				id: { type: new GraphQLNonNull(GraphQLID) },
			},
			resolve: getCategoryResolver,
		},

		features: {
			args: {
				name: StringTypeGeneric,
				...PageLimitFilter,
				id: IdTypeGeneric,
			},
			type: new GraphQLList(Feature),
			resolve: getFeaturesResolver,
		},

		feature: {
			type: Feature,
			args: {
				id: { type: new GraphQLNonNull(GraphQLID) },
			},
			resolve: getFeatureResolver,
		},

		propertyTypes: {
			args: {
				...PageLimitFilter,
				name: StringTypeGeneric,
				id: IdTypeGeneric,
			},
			type: new GraphQLList(PropertyType),
			resolve: getPropertyTypesResolver,
		},

		propertyType: {
			type: PropertyType,
			args: {
				id: { type: new GraphQLNonNull(GraphQLID) },
			},
			resolve: getPropertyTypeResolver,
		},

		agencies: {
			args: {
				date_added: StringTypeGeneric,
				address: StringTypeGeneric,
				phone: StringTypeGeneric,
				id: IdTypeGeneric,
				...PageLimitFilter,
			},
			type: new GraphQLList(Agency),
			resolve: getAgenciesResolver,
		},

		agency: {
			type: Agency,
			args: {
				id: { type: new GraphQLNonNull(GraphQLID) },
			},
			resolve: getAgencyResolver,
		},
	}),
});

// export const RootMutation = new GraphQLObjectType({
// 	name: 'Mutation',
// 	fields: () => ({
// 		addUser: {
// 			resolve: createUserResolver,
// 			type: User,
// 			args: {
// 				email_addr: {
// 					type: new GraphQLNonNull(GraphQLString),
// 				},
// 				is_landlord: {
// 					type: new GraphQLNonNull(GraphQLBoolean),
// 				},
// 				password: {
// 					type: new GraphQLNonNull(GraphQLString),
// 				},
// 				kra_pin: {
// 					type: new GraphQLNonNull(GraphQLString),
// 				},
// 				phone: {
// 					type: new GraphQLNonNull(GraphQLString),
// 				},
// 				id_no: {
// 					type: new GraphQLNonNull(GraphQLInt),
// 				},
// 				first_name: {
// 					type: new GraphQLNonNull(GraphQLString),
// 				},
// 				last_name: {
// 					type: new GraphQLNonNull(GraphQLString),
// 				},
// 				avatar: {
// 					type: new GraphQLNonNull(GraphQLString),
// 					defaultValue: '',
// 				},
// 			},
// 		},
// 	}),
// });
