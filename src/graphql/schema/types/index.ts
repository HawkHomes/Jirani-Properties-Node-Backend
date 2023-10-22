import {
	GraphQLInputObjectType,
	GraphQLObjectType,
	GraphQLEnumType,
	GraphQLBoolean,
	GraphQLNonNull,
	GraphQLString,
	GraphQLFloat,
	GraphQLInt,
	GraphQLList,
	GraphQLID,
} from 'graphql';

import { assetStatus } from '../../../types';

export const StringTypeGeneric = {
	type: GraphQLString,
};

export const StringTypeGenericArray = {
	type: new GraphQLList(GraphQLString),
};

export const IntTypeGeneric = {
	type: GraphQLInt,
};

export const MinMaxFilter = new GraphQLInputObjectType({
	name: 'minMaxFilter',
	fields: {
		min: IntTypeGeneric,
		max: IntTypeGeneric,
	},
});

export const PageLimitFilter = {
	limit: IntTypeGeneric,
	page: IntTypeGeneric,
};

export const IdTypeGeneric = {
	type: GraphQLID,
};

export const statusTypeGeneric = {
	type: new GraphQLEnumType({
		name: 'StatusEnumType',
		values: Object.entries(assetStatus).reduce(
			(prev, [key, value]) => ({
				...prev,
				[value]: {
					value,
				},
			}),
			{}
		),
	}),
};

export const IdTypeGenericArray = {
	type: new GraphQLList(GraphQLID),
};

export const BooleanTypeGeneric = { type: GraphQLBoolean };

export const FloatTypeGeneric = { type: GraphQLFloat };

export const FloatTypeGenericArray = { type: new GraphQLList(GraphQLFloat) };

export const LocationFilter = new GraphQLInputObjectType({
	name: 'currLocationType',
	fields: {
		long: FloatTypeGeneric,
		lat: FloatTypeGeneric,
	},
});

export const BasePropertyFilters = {
	nearest_town: StringTypeGeneric,
	year_built: { type: MinMaxFilter },
	features: IdTypeGenericArray,
	land_size: { type: MinMaxFilter },
	status: statusTypeGeneric,
	sort: StringTypeGeneric,
	currLocation: {
		type: LocationFilter,
	},
	agency: IdTypeGenericArray,
	address: StringTypeGeneric,
	type: IdTypeGenericArray,
	name: StringTypeGeneric,
	// 5km radius
	radius: IntTypeGeneric,
};

export const Coords = new GraphQLObjectType({
	name: 'CoordsType',
	fields: () => ({
		coordinates: FloatTypeGenericArray,
		type: StringTypeGeneric,
	}),
});

export const GeoPoint = new GraphQLInputObjectType({
	name: 'GeoPoint',
	fields: () => ({
		alt: { type: new GraphQLNonNull(GraphQLFloat), defaultValue: 0 },
		long: { type: new GraphQLNonNull(GraphQLFloat) },
		lat: { type: new GraphQLNonNull(GraphQLFloat) },
	}),
});

export const PropertyType = new GraphQLObjectType({
	name: 'PropertyTypeType',
	fields: () => ({
		name: StringTypeGeneric,
		id: IdTypeGeneric,
	}),
});

export const Category = new GraphQLObjectType({
	name: 'CategoryType',
	fields: () => ({
		name: StringTypeGeneric,
		id: IdTypeGeneric,
	}),
});

export const Feature = new GraphQLObjectType({
	name: 'FeatureType',
	fields: () => ({
		name: StringTypeGeneric,
		id: IdTypeGeneric,
	}),
});

export const House = new GraphQLObjectType({
	name: 'HouseType',
	fields: () => ({
		features: { type: new GraphQLList(Feature) },
		date_updated: StringTypeGeneric,
		additional_info: StringTypeGeneric,
		photos: StringTypeGenericArray,
		total_available: IntTypeGeneric,
		date_added: StringTypeGeneric,
		property: { type: Property },
		category: { type: Category },
		status: statusTypeGeneric,
		cost: FloatTypeGeneric,
		id: IdTypeGeneric,
	}),
});

export const Property = new GraphQLObjectType({
	name: 'PropertyType',
	fields: () => ({
		photos: StringTypeGenericArray,
		agency: {
			type: Agency,
		},
		features: { type: new GraphQLList(Feature) },
		review: { type: new GraphQLList(Review) },
		houses: { type: new GraphQLList(House) },
		additional_info: StringTypeGeneric,
		nearest_town: StringTypeGeneric,
		year_built: IntTypeGeneric,
		status: statusTypeGeneric,
		address: StringTypeGeneric,
		land_size: IntTypeGeneric,
		name: StringTypeGeneric,
		owner: { type: User },
		id: IdTypeGeneric,
		type: {
			type: PropertyType,
		},
		coords: {
			type: Coords,
		},
	}),
});

export const Review = new GraphQLObjectType({
	name: 'ReviewType',
	fields: () => ({
		date_created: StringTypeGeneric,
		date_updated: StringTypeGeneric,
		property: { type: Property },
		review: StringTypeGeneric,
		rating: StringTypeGeneric,
		owner: { type: User },
		id: IdTypeGeneric,
	}),
});

export const Perm = new GraphQLObjectType({
	name: 'PermType',
	fields: () => ({
		role: StringTypeGeneric,
		id: IdTypeGeneric,
	}),
});

export const Profile = new GraphQLObjectType({
	name: 'ProfileType',
	fields: () => ({
		email_addr: StringTypeGeneric,
		kra_pin: StringTypeGeneric,
		avatar: StringTypeGeneric,
		phone: StringTypeGeneric,
		id_no: IntTypeGeneric,
		id: IdTypeGeneric,
	}),
});

export const User = new GraphQLObjectType({
	name: 'UserType',
	fields: {
		review: { type: new GraphQLList(Review) },
		date_added: StringTypeGeneric,
		first_name: StringTypeGeneric,
		last_name: StringTypeGeneric,
		verified: BooleanTypeGeneric,
		disabled: BooleanTypeGeneric,
		active: BooleanTypeGeneric,
		profile: { type: Profile },
		id: IdTypeGeneric,
		perm: { type: Perm },
	},
});

export const Agency = new GraphQLObjectType({
	name: 'AgencyType',
	fields: () => ({
		properties: { type: new GraphQLList(Property) },
		users: { type: new GraphQLList(User) },
		date_updated: StringTypeGeneric,
		website_url: StringTypeGeneric,
		date_added: StringTypeGeneric,
		address: StringTypeGeneric,
		licence: StringTypeGeneric,
		phone: StringTypeGeneric,
		name: StringTypeGeneric,
		id: IdTypeGeneric,
	}),
});

export type CustomErrorType = {
	status: number;
	details: string;
	title: string;
	type: string;
	data?: any;
};
