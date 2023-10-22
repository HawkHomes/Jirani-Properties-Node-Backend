import { TypeORMError, Equal, Point, Brackets } from 'typeorm';
import { Request, Response } from 'express';

import {
	assetStatus,
	dataOrderingEnum,
	propertyFilterInterface,
	propertyInterface,
	roleInterface,
} from './../types';
import {
	TYPE_INTERNAL_ERROR,
	TYPE_BAD_REQUEST,
	TYPE_ITEM_CREATED,
	TYPE_NOT_FOUND,
	TYPE_NO_CONTENT,
	TYPE_OK,
} from '../utils/constants';
import { getWKTCoords } from '../utils/common';
import { AppDataSource } from '../data-source';
import { Property } from './../entity/Property';
import { User } from './../entity/User';

import { PropertyType } from '../entity/PropertyType';
import { Agency } from '../entity/Agency';
import { Feature } from '../entity/Feature';
import { ResponseAndLoggerWrapper } from '../logger/Logger';

// #create acc
export const createProperty: (
	req: Request,
	res: Response
) => Promise<any> = async (req, res) => {
	const {
		agency: agencyName,
		additional_info,
		nearest_town,
		coordinates,
		year_built,
		features,
		land_size,
		address,
		status,
		photos,
		name,
		type,
	}: propertyInterface<number> = req.body;

	const formatedCoordinates = getWKTCoords({
		long: parseFloat(`${coordinates.long}`),
		lat: parseFloat(`${coordinates.lat}`),
	});

	const findThisProperty = AppDataSource.manager
		.getRepository(Property)
		.createQueryBuilder('property')
		.leftJoinAndSelect('property.agency', 'agency')
		.where('property.name =:propName', { propName: name })
		.andWhere(
			'ST_DWithin(property.coords, ST_MakePoint(:long,:lat)::geography,:radius)',
			{
				long: formatedCoordinates.coordinates[0],
				lat: formatedCoordinates.coordinates[1],
				radius: 20,
			}
		);

	if (agencyName)
		findThisProperty.andWhere('agency.id =:agencyId', { agencyId: agencyName });

	if (await findThisProperty.getOne())
		return new ResponseAndLoggerWrapper({
			res,
			req,
			payload: {
				...TYPE_BAD_REQUEST,
				details: `Property (${name}) already exists`,
			},
		});

	const condition = {
		id: Equal(req?.user?.id),
	};

	const user = await AppDataSource.manager.findOne(User, {
		where: condition,
	});

	const property = new Property();

	property.status =
		status === assetStatus.ForAuction
			? assetStatus.ForAuction
			: status === assetStatus.ForRent
			? assetStatus.ForRent
			: status === assetStatus.ForSale
			? assetStatus.ForSale
			: status === assetStatus.Sold
			? assetStatus.Sold
			: assetStatus.Upcoming;

	property.year_built = year_built;
	property.land_size = land_size;

	const foundPropType = await AppDataSource.manager.findOne(PropertyType, {
		where: {
			id: Equal(type),
		},
	});

	if (!foundPropType)
		return new ResponseAndLoggerWrapper({
			res,
			req,
			payload: {
				...TYPE_NOT_FOUND,
				details: 'Property Type Not Found',
			},
		});

	const coords: Point = {
		coordinates: [coordinates.long, coordinates.lat],
		type: 'Point',
	};

	property.additional_info = additional_info;
	property.nearest_town = nearest_town;
	property.type = foundPropType;
	property.address = address;
	property.photos = photos;
	property.coords = coords;
	property.owner = user;
	property.name = name;

	property.features =
		features && features.length > 0
			? await AppDataSource.manager
					.createQueryBuilder(Feature, 'feature')
					.where('feature.id IN (:...features)', {
						features,
					})
					.getMany()
			: [];

	if (agencyName) {
		const foundAgency = await AppDataSource.manager
			.getRepository(Agency)
			.createQueryBuilder('agency')
			.where('agency.id =:id', { id: agencyName })
			.getOne();

		if (!foundAgency)
			return new ResponseAndLoggerWrapper({
				res,
				req,
				payload: {
					...TYPE_NOT_FOUND,
					details: 'Agency Not Found',
				},
			});

		property.agency = foundAgency;
	} else {
		const foundAgency = await AppDataSource.manager.findOne(Agency, {
			where: { name: process.env.COMPANY_NAME },
		});

		if (!foundAgency)
			return new ResponseAndLoggerWrapper({
				req,
				res,
				payload: {
					...TYPE_NOT_FOUND,
					details: 'Agency Not Found',
				},
			});

		property.agency = foundAgency;
	}

	return AppDataSource.manager
		.save(property)
		.then((savedProperty) => {
			new ResponseAndLoggerWrapper({
				res,
				req,
				payload: {
					...TYPE_ITEM_CREATED,
					data: savedProperty,
				},
			});
		})
		.catch(
			(err: TypeORMError) =>
				new ResponseAndLoggerWrapper({
					res,
					req,
					err,
					payload: {
						...TYPE_INTERNAL_ERROR,
					},
				})
		);
};

// update property
export const updateProperty: (
	req: Request,
	res: Response
) => Promise<any> = async (req, res) => {
	const { pid } = req.params;

	const {
		additional_info, //done
		nearest_town, //done
		coordinates, //done
		year_built, //done
		features, //done
		land_size, //done
		address, //done
		status, //done
		agency, //done
		name, //done
		type, //done
		photos,
	} = req.body;

	const user = await AppDataSource.manager
		.createQueryBuilder(User, 'user')
		.where('user.id =:id', { id: req.user.id })
		.getOne();

	const propManager = AppDataSource.manager
		.createQueryBuilder(Property, 'property')
		.leftJoinAndSelect('property.features', 'features')
		.where('property.id =:pid', { pid });

	if ((await user.perm.role) !== roleInterface.Admin)
		propManager.andWhere('property.owner =:owner', { owner: req.user.id });

	//get a single property
	const foundProperty = await propManager.getOne();

	if (!foundProperty)
		return new ResponseAndLoggerWrapper({
			res,
			req,
			payload: {
				...TYPE_NOT_FOUND,
				details: 'Property Not Found',
			},
		});

	//update the partial values
	foundProperty.additional_info =
		additional_info ?? foundProperty.additional_info;
	foundProperty.nearest_town = nearest_town ?? foundProperty.nearest_town;
	foundProperty.year_built = year_built ?? foundProperty.year_built;
	foundProperty.land_size = land_size ?? foundProperty.land_size;
	foundProperty.address = address ?? foundProperty.address;
	foundProperty.photos = photos ?? foundProperty.photos;
	foundProperty.name = name ?? foundProperty.name;

	//update the apartment status
	foundProperty.status = status
		? status === assetStatus.ForAuction
			? assetStatus.ForAuction
			: status === assetStatus.ForRent
			? assetStatus.ForRent
			: status === assetStatus.ForSale
			? assetStatus.ForSale
			: status === assetStatus.Sold
			? assetStatus.Sold
			: assetStatus.Upcoming
		: foundProperty.status;

	if (features && features.length > 0) {
		const featuresFound = await AppDataSource.manager
			.getRepository(Feature)
			.createQueryBuilder('feature')
			.where('feature.id IN (:...features)', { features })
			.getMany();

		if (!featuresFound || features.length === 0)
			return new ResponseAndLoggerWrapper({
				res,
				req,
				payload: {
					...TYPE_NOT_FOUND,
					details: `Feature Not Found`,
				},
			});

		foundProperty.features = featuresFound;
	}

	if (agency) {
		const agencyFound = await AppDataSource.manager
			.getRepository(Agency)
			.createQueryBuilder('agency')
			.where('agency.id =:agency', { agency })
			.getOne();

		if (!agencyFound)
			return new ResponseAndLoggerWrapper({
				res,
				req,
				payload: {
					...TYPE_NOT_FOUND,
					details: 'Agency provided was not found Not Found',
				},
			});

		foundProperty.agency = agencyFound;
	}

	if (type) {
		const typeFound = await AppDataSource.manager
			.getRepository(PropertyType)
			.createQueryBuilder('type')
			.where('type.id =:type', { type })
			.getOne();

		if (!typeFound)
			return new ResponseAndLoggerWrapper({
				res,
				req,
				payload: {
					...TYPE_NOT_FOUND,
					details: 'Property type provided was not found Not Found',
				},
			});

		foundProperty.type = typeFound;
	}

	if (coordinates) {
		const coords: Point = {
			coordinates: [coordinates.long, coordinates.lat],
			type: 'Point',
		};

		foundProperty.coords = coords;
	}

	return AppDataSource.manager
		.save(foundProperty)
		.then(
			() =>
				new ResponseAndLoggerWrapper({
					res,
					req,
					payload: {
						...TYPE_NO_CONTENT,
					},
				})
		)
		.catch(
			(err: Error) =>
				new ResponseAndLoggerWrapper({
					res,
					req,
					err,
					payload: TYPE_INTERNAL_ERROR,
				})
		);
};

// get all properties
export const getAllProperties: (
	req: Request,
	res: Response
) => Promise<any> = async (req, res) => {
	const currDate: Date = new Date();

	const {
		year_built = { max: currDate.getFullYear(), min: 1970 },
		sort = dataOrderingEnum.Ascending,
		nearest_town,
		currLocation,
		// 5km radius
		radius = 5000,
		features,
		land_size,
		limit = 10,
		page = 1,
		address,
		status,
		name,
		type,
		id,
	}: Partial<propertyFilterInterface> = req.query;

	const myManager = AppDataSource.getRepository(Property)
		.createQueryBuilder('property')
		.leftJoinAndSelect('property.type', 'type')
		.leftJoinAndSelect('property.features', 'features')
		.leftJoinAndSelect('property.owner', 'owner')
		.leftJoinAndSelect('property.houses', 'houses')
		.leftJoinAndSelect('houses.category', 'category')
		.leftJoinAndSelect('houses.features', 'housesFeatures')
		.leftJoinAndSelect('property.agency', 'agency')
		.where('property.year_built >= :min and property.year_built <= :max', {
			max: parseInt(`${year_built.max}`) ?? currDate.getFullYear(),
			min: parseInt(`${year_built.min}`) ?? 1970,
		});

	if (id)
		myManager.andWhere('property.id =:propertyId', {
			propertyId: id,
		});

	if (nearest_town)
		myManager.andWhere('property.nearest_town ILIKE :nearest_town', {
			nearest_town: `%${nearest_town}%`,
		});

	if (land_size)
		myManager.andWhere(
			'property.land_size >= :minLandSize and property.land_size <= :maxLandSize',
			{
				maxLandSize: land_size.max,
				minLandSize: land_size.min,
			}
		);

	if (type)
		myManager.andWhere('type.id IN (:...type)', {
			type,
		});

	if (status)
		myManager.andWhere('property.status =:status', {
			status:
				status === assetStatus.ForAuction
					? assetStatus.ForAuction
					: status === assetStatus.Upcoming
					? assetStatus.Upcoming
					: status === assetStatus.ForRent
					? assetStatus.ForRent
					: status === assetStatus.ForSale
					? assetStatus.ForSale
					: status === assetStatus.Sold
					? assetStatus.Sold
					: assetStatus.ForRent,
		});

	if (name)
		myManager.andWhere('property.name ILIKE :name', {
			name: `%${name}%`,
		});

	if (address)
		myManager.andWhere('property.address ILIKE :address', {
			address: `%${address}%`,
		});

	if (features && features.length > 0)
		myManager.andWhere(
			new Brackets((qb) => {
				qb.andWhere('features.id IN (:...features)', {
					features,
				}).orWhere('housesFeatures.id IN (:...features)', {
					features,
				});
			})
		);

	if (currLocation) {
		const formatedCoordinates = getWKTCoords({
			long: parseFloat(currLocation.long),
			lat: parseFloat(currLocation.lat),
		});

		myManager.andWhere(
			'ST_DWithin(property.coords, ST_MakePoint(:long,:lat)::geography,:radius)',
			{
				long: formatedCoordinates.coordinates[0],
				lat: formatedCoordinates.coordinates[1],
				radius,
			}
		);
	}

	// return back the query payload
	return myManager
		.orderBy(
			'property.name',
			sort.toLocaleUpperCase() === dataOrderingEnum.Descending
				? dataOrderingEnum.Descending
				: dataOrderingEnum.Descending
		)
		.take(limit)
		.offset((page - 1) * limit)
		.getManyAndCount()
		.then(
			([data, count]) =>
				new ResponseAndLoggerWrapper({
					req,
					res,
					payload: {
						...TYPE_OK,
						data: { data, count },
					},
				})
		)
		.catch(
			(err: Error) =>
				new ResponseAndLoggerWrapper({
					res,
					err,
					req,
					payload: {
						...TYPE_BAD_REQUEST,
					},
				})
		);
};

// get single properties
export const getSingleProperty: (
	req: Request,
	res: Response
) => Promise<any> = async (req, res) => {
	const { pid } = req.params;

	return AppDataSource.manager
		.getRepository(Property)
		.createQueryBuilder('property')
		.leftJoinAndSelect('property.owner', 'owner')
		.leftJoinAndSelect('property.review', 'review')
		.leftJoinAndSelect('property.houses', 'houses')
		.leftJoinAndSelect('houses.category', 'category')
		.leftJoinAndSelect('property.agency', 'agency')
		.leftJoinAndSelect('property.features', 'features')
		.leftJoinAndSelect('property.type', 'type')
		.where('property.id =:pid', { pid })
		.getOne()
		.then(
			(property) =>
				new ResponseAndLoggerWrapper({
					req,
					res,
					payload: property
						? {
								...TYPE_OK,
								data: property,
						  }
						: {
								...TYPE_NOT_FOUND,
								details: 'Property Not Found',
						  },
				})
		)
		.catch(
			(err: Error) =>
				new ResponseAndLoggerWrapper({
					res,
					err,
					req,
					payload: {
						...TYPE_BAD_REQUEST,
					},
				})
		);
};

// delete property
export const removeProperty: (
	req: Request,
	res: Response
) => Promise<any> = async (req, res) => {
	const { pid } = req.params;

	const user = await AppDataSource.manager
		.getRepository(User)
		.createQueryBuilder('user')
		.where('user.id =:id', { id: req.user.id })
		.getOne();

	const property = AppDataSource.manager
		.getRepository(Property)
		.createQueryBuilder('property')
		.where('property.id =:pid', { pid });

	if ((await user.perm.role) === roleInterface.Admin)
		property.andWhere('property.owner =:owner', { owner: req.user.id });

	if (!(await property.getOne()))
		return new ResponseAndLoggerWrapper({
			res,
			req,
			payload: {
				...TYPE_NOT_FOUND,
				details: 'Property Not Found',
			},
		});

	const mainManager = AppDataSource.createQueryBuilder()
		.softDelete()
		.from(Property)
		.where('id =:pid', { pid });

	if ((await user.perm.role) === roleInterface.Admin)
		mainManager.andWhere('owner =:owner', { owner: req.user.id });

	return mainManager
		.execute()
		.then(
			() =>
				new ResponseAndLoggerWrapper({
					res,
					req,
					payload: {
						...TYPE_NO_CONTENT,
					},
				})
		)
		.catch(
			(err: Error) =>
				new ResponseAndLoggerWrapper({
					res,
					err,
					req,
					payload: {
						...TYPE_INTERNAL_ERROR,
					},
				})
		);
};
