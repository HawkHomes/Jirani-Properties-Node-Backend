import { TypeORMError, Brackets } from 'typeorm';
import { Request, Response } from 'express';

import { getWKTCoords } from '../utils/common';
import {
	TYPE_INTERNAL_ERROR,
	TYPE_ITEM_CREATED,
	TYPE_NO_CONTENT,
	TYPE_BAD_REQUEST,
	TYPE_NOT_FOUND,
	TYPE_OK,
} from './../utils/constants';

import {
	houseFilterInterface,
	dataOrderingEnum,
	roleInterface,
} from './../types';
import { Category } from './../entity/Category';
import { Property } from './../entity/Property';
import { AppDataSource } from '../data-source';
import { Feature } from '../entity/Feature';
import { House } from './../entity/House';
import { ResponseAndLoggerWrapper } from '../logger/Logger';

// #create house
export const createHouse: (
	req: Request,
	res: Response
) => Promise<any> = async (req, res) => {
	const { pid } = req.params;

	const {
		total_available,
		additional_info,
		category,
		features,
		for_sale,
		photos,
		cost,
	} = req.body;

	const foundProperty = await AppDataSource.manager
		.getRepository(Property)
		.createQueryBuilder('property')
		.where('property.id =:pid', { pid })
		.andWhere('property.owner =:owner', { owner: req.user.uid })
		.getOne();

	if (!foundProperty)
		return new ResponseAndLoggerWrapper({
			req,
			res,
			payload: {
				...TYPE_NOT_FOUND,
				details: 'Property not found',
			},
		});

	const foundCategory = await AppDataSource.manager
		.getRepository(Category)
		.createQueryBuilder('category')
		.where('category.id =:category', { category })
		.getOne();

	if (!foundCategory)
		return new ResponseAndLoggerWrapper({
			req,
			res,
			payload: {
				...TYPE_NOT_FOUND,
				details: 'Category not found',
			},
		});

	const newHouse = new House();
	newHouse.total_available = total_available;
	newHouse.additional_info = additional_info;

	if (features && features.length > 0)
		newHouse.features = await AppDataSource.manager
			.getRepository(Feature)
			.createQueryBuilder('features')
			.where('features.id IN (:...features)', { features })
			.getMany();

	newHouse.category = foundCategory;
	newHouse.property = foundProperty;
	newHouse.photos = photos ?? [];
	newHouse.for_sale = for_sale;
	newHouse.cost = cost;

	return AppDataSource.manager
		.save(newHouse)
		.then(
			(newHouse) =>
				new ResponseAndLoggerWrapper({
					res,
					payload: {
						...TYPE_ITEM_CREATED,
						data: newHouse,
					},
					req,
				})
		)
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

// update house
export const updateHouse: (
	req: Request,
	res: Response
) => Promise<any> = async (req, res) => {
	const { hid, pid } = req.params;

	const {
		total_available,
		additional_info,
		features,
		category,
		for_sale,
		photos,
		cost,
	} = req.body;

	const myManager = AppDataSource.manager
		.getRepository(Property)
		.createQueryBuilder('property')
		.where('property.id =:pid', { pid });

	req.user.perm.role === roleInterface.Admin
		? null
		: myManager.andWhere('property.owner =:owner', { owner: req.user.uid });

	const property = await myManager.getOne();

	if (!property)
		return new ResponseAndLoggerWrapper({
			res,
			req,
			payload: {
				...TYPE_NOT_FOUND,
				details: 'Property Not Found',
			},
		});

	if (category) {
		const catFound = await AppDataSource.manager
			.getRepository(Category)
			.createQueryBuilder('category')
			.where('category.id =:id', { id: category })
			.getOne();

		if (!catFound)
			return new ResponseAndLoggerWrapper({
				res,
				req,
				payload: {
					...TYPE_NOT_FOUND,
					details: 'Category Not Found',
				},
			});
	}

	if (features && features.length > 0) {
		const featuresFound = await AppDataSource.manager
			.getRepository(Feature)
			.createQueryBuilder('feature')
			.where('feature.id IN (:...features)', { features })
			.getMany();

		if (!featuresFound)
			return new ResponseAndLoggerWrapper({
				res,
				req,
				payload: {
					...TYPE_NOT_FOUND,
					details: 'Feature Not Found',
				},
			});
	}

	const hse = await AppDataSource.manager
		.getRepository(House)
		.createQueryBuilder('house')
		.leftJoinAndSelect('house.property', 'property')
		.where('property.id =:pid', { pid })
		.andWhere('house.id =:hid', { hid })
		.getOne();

	if (!hse)
		return new ResponseAndLoggerWrapper({
			req,
			res,
			payload: {
				...TYPE_NOT_FOUND,
				details: 'House Not Found',
			},
		});

	const dataToUpdate: Object = {
		...(total_available ? { total_available } : {}),
		...(additional_info ? { additional_info } : {}),
		...(features
			? {
					features,
			  }
			: {}),
		...(photos ? { photos: [...hse.photos, photos] } : {}),
		...(category ? { category } : {}),
		...(for_sale ? { for_sale } : {}),
		...(cost ? { cost } : {}),
	};

	return AppDataSource.manager
		.createQueryBuilder()
		.leftJoinAndSelect('property', 'property')
		.update(House)
		.set({ ...dataToUpdate })
		.where('property.id =:pid', { pid })
		.andWhere('id =:hid', { hid })
		.execute()
		.then(
			() =>
				new ResponseAndLoggerWrapper({
					res,
					payload: {
						...TYPE_NO_CONTENT,
					},
					req,
				})
		)
		.catch(
			(err: Error) =>
				new ResponseAndLoggerWrapper({
					req,
					res,
					err,
					payload: {
						...TYPE_INTERNAL_ERROR,
					},
				})
		);
};

export const getAllHouses: (
	req: Request,
	res: Response
) => Promise<any> = async (req, res) => {
	const currDate: Date = new Date();

	const {
		year_built = { max: currDate.getFullYear(), min: 1970 },
		sort = dataOrderingEnum.Ascending,
		land_size = { min: 0, max: 1000000 },
		agency,
		cost = {
			// max default value
			max: 10000000,
			min: 0,
		},
		nearest_town,
		total_available,
		// 5km radius
		radius = 5000,
		currLocation,
		features,
		category,
		for_sale,
		address,
		limit = 10,
		page = 1,
		name,
		type,
		id,
	}: Partial<houseFilterInterface> = req.query;

	const myManager = AppDataSource.getRepository(House)
		.createQueryBuilder('house')
		.leftJoinAndSelect('house.category', 'category')
		.leftJoinAndSelect('house.property', 'property')
		.leftJoinAndSelect('house.features', 'features')
		.leftJoinAndSelect('property.type', 'propertyType')
		.leftJoinAndSelect('property.features', 'propertyFeature')
		.leftJoinAndSelect('property.agency', 'agency')
		.leftJoinAndSelect('property.owner', 'owner')
		.leftJoinAndSelect('owner.profile', 'profile')
		.where('property.year_built >=:min and property.year_built <=:max', {
			max: year_built.max
				? parseInt(`${year_built.max}`)
				: currDate.getFullYear(),
			min: year_built.min ? parseInt(`${year_built.min}`) : 1970,
		})
		.andWhere('house.cost >= :minCost and house.cost <= :maxCost', {
			maxCost: cost.max ?? 10000000,
			minCost: cost.min ?? 0,
		});

	if (for_sale === true || for_sale === false)
		myManager.andWhere('house.for_sale = :for_sale', {
			for_sale,
		});

	if (category)
		myManager.andWhere('category.id IN (:...category)', {
			category,
		});

	if (total_available)
		myManager.andWhere('house.total_available =:total_available', {
			total_available,
		});

	if (id) myManager.andWhere('house.id =:id', { id });

	if (nearest_town)
		myManager.andWhere('property.nearest_town ILIKE :nearest_town', {
			nearest_town: `%${nearest_town}%`,
		});

	if (type)
		myManager.andWhere('propertyType.id IN (:...type)', {
			type,
		});

	if (agency) myManager.andWhere('agency.id =:agencyId', { agencyId: agency });

	if (land_size.max && land_size.min)
		myManager.andWhere(
			'land_size >= :minLandSize and land_size <= :maxLandSize',
			{
				maxLandSize: land_size.max,
				minLandSize: land_size.min,
			}
		);

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
			new Brackets((qb) =>
				qb
					.where('propertyFeature.id IN (:...features)', {
						features,
					})
					.orWhere('features.id IN (:...features)', {
						features,
					})
			)
		);

	if (currLocation && currLocation.lat && currLocation.long && radius) {
		const formatedCoordinates = getWKTCoords({
			long: parseFloat(currLocation.long),
			lat: parseFloat(currLocation.lat),
		});

		// units of radius are in are in meters
		myManager.andWhere(
			'ST_DWithin(property.coords, ST_MakePoint(:long,:lat)::geography,:radius)',
			{
				long: formatedCoordinates.coordinates[0],
				lat: formatedCoordinates.coordinates[1],
				radius,
			}
		);
	}

	return myManager
		.orderBy(
			'house.cost',
			sort.toLocaleUpperCase() === dataOrderingEnum.Ascending
				? dataOrderingEnum.Ascending
				: dataOrderingEnum.Descending
		)
		.offset((page - 1) * limit)
		.take(limit)
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
					payload: TYPE_INTERNAL_ERROR,
					err,
					res,
					req,
				})
		);
};

// get all property houses
export const getAllPropertyHouses: (
	req: Request,
	res: Response
) => Promise<any> = async (req, res) => {
	const currDate: Date = new Date();
	const { pid } = req.params;

	const {
		year_built = { max: currDate.getFullYear(), min: 1970 },
		sort = dataOrderingEnum.Ascending,
		land_size = { min: 0, max: 1000000 },
		agency,
		cost = {
			// max default value
			max: 10000000,
			min: 0,
		},
		nearest_town,
		total_available,
		// 5km radius
		radius = 5000,
		currLocation,
		features,
		category,
		for_sale,
		address,
		limit = 10,
		page = 1,
		name,
		type,
		id,
	}: Partial<houseFilterInterface> = req.query;

	const myManager = AppDataSource.getRepository(House)
		.createQueryBuilder('house')
		.leftJoinAndSelect('house.category', 'category')
		.leftJoinAndSelect('house.property', 'property')
		.leftJoinAndSelect('house.features', 'features')
		.leftJoinAndSelect('property.type', 'propertyType')
		.leftJoinAndSelect('property.features', 'propertyFeature')
		.leftJoinAndSelect('property.agency', 'agency')
		.leftJoinAndSelect('property.owner', 'owner')
		.leftJoinAndSelect('owner.profile', 'profile')
		.where('property.year_built >=:min and property.year_built <=:max', {
			max: year_built.max
				? parseInt(`${year_built.max}`)
				: currDate.getFullYear(),
			min: year_built.min ? parseInt(`${year_built.min}`) : 1970,
		})
		.andWhere('house.cost >= :minCost and house.cost <= :maxCost', {
			maxCost: cost.max ?? 10000000,
			minCost: cost.min ?? 0,
		})
		.andWhere('property.id =:pid', { pid });

	if (for_sale === true || for_sale === false)
		myManager.andWhere('house.for_sale =:for_sale', {
			for_sale,
		});

	if (category)
		myManager.andWhere('category.id IN (:...category)', {
			category,
		});

	if (total_available)
		myManager.andWhere('house.total_available =:total_available', {
			total_available,
		});

	if (id) myManager.andWhere('house.id =:id', { id });

	if (nearest_town)
		myManager.andWhere('property.nearest_town ILIKE :nearest_town', {
			nearest_town: `%${nearest_town}%`,
		});

	if (type)
		myManager.andWhere('propertyType.id IN (:...type)', {
			type,
		});

	if (agency) myManager.andWhere('agency.id =:agencyId', { agencyId: agency });

	if (land_size.max && land_size.min)
		myManager.andWhere(
			'land_size >= :minLandSize and land_size <= :maxLandSize',
			{
				maxLandSize: land_size.max,
				minLandSize: land_size.min,
			}
		);

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
			new Brackets((qb) =>
				qb
					.where('propertyFeature.id IN (:...features)', {
						features,
					})
					.orWhere('features.id IN (:...features)', {
						features,
					})
			)
		);

	if (currLocation && currLocation.lat && currLocation.long && radius) {
		const formatedCoordinates = getWKTCoords({
			long: parseFloat(currLocation.long),
			lat: parseFloat(currLocation.lat),
		});

		// units of radius are in are in meters
		myManager.andWhere(
			'ST_DWithin(property.coords, ST_MakePoint(:long,:lat)::geography,:radius)',
			{
				long: formatedCoordinates.coordinates[0],
				lat: formatedCoordinates.coordinates[1],
				radius,
			}
		);
	}

	return myManager
		.orderBy(
			'house.cost',
			sort.toLocaleUpperCase() === dataOrderingEnum.Ascending
				? dataOrderingEnum.Ascending
				: dataOrderingEnum.Descending
		)
		.offset((page - 1) * limit)
		.take(limit)
		.getManyAndCount()
		.then(
			([data, count]) =>
				new ResponseAndLoggerWrapper({
					res,
					req,
					payload: {
						...TYPE_OK,
						data: { data, count },
					},
				})
		)
		.catch(
			(err: Error) =>
				new ResponseAndLoggerWrapper({
					payload: TYPE_BAD_REQUEST,
					err,
					res,
					req,
				})
		);
};

// get single properties
export const getSingleSingleHouse: (
	req: Request,
	res: Response
) => Promise<any> = async (req, res) => {
	const { hid, pid } = req.params;

	const manager = AppDataSource.manager
		.getRepository(House)
		.createQueryBuilder('house')
		.leftJoinAndSelect('house.category', 'category')
		.leftJoinAndSelect('house.property', 'property')
		.leftJoinAndSelect('house.features', 'features')
		.leftJoinAndSelect('property.type', 'propertyType')
		.leftJoinAndSelect('property.features', 'propertyFeature')
		.leftJoinAndSelect('property.agency', 'agency')
		.leftJoinAndSelect('property.owner', 'owner')
		.leftJoinAndSelect('owner.profile', 'profile')
		.where('house.id =:hid', { hid });

	if (pid) manager.andWhere('property.id =:pid', { pid });

	return manager
		.getOne()
		.then(
			(house) =>
				new ResponseAndLoggerWrapper({
					res,
					req,
					payload: house
						? {
								...TYPE_OK,
								data: house,
						  }
						: {
								...TYPE_NOT_FOUND,
								details: 'House Not Found',
						  },
				})
		)
		.catch(
			(err: Error) =>
				new ResponseAndLoggerWrapper({
					res,
					req,
					err,
					payload: {
						...TYPE_BAD_REQUEST,
					},
				})
		);
};

// delete house
export const removeHouse: (
	req: Request,
	res: Response
) => Promise<any> = async (req, res) => {
	const { hid, pid } = req.params;

	const myManager = AppDataSource.manager
		.getRepository(Property)
		.createQueryBuilder('property')
		.where('property.id =:pid', { pid });

	req.user.perm.role === roleInterface.Admin
		? null
		: myManager.andWhere('property.owner =:owner', { owner: req.user.uid });

	const property = await myManager.getOne();
	if (!property)
		return new ResponseAndLoggerWrapper({
			req,
			res,
			payload: {
				...TYPE_NOT_FOUND,
				details: 'Property Not Found',
			},
		});

	const hse = await AppDataSource.manager
		.getRepository(House)
		.createQueryBuilder('house')
		.leftJoinAndSelect('house.property', 'property')
		.where('property.id =:pid', { pid })
		.andWhere('house.id =:hid', { hid })
		.getOne();

	if (!hse)
		return new ResponseAndLoggerWrapper({
			res,
			req,
			payload: {
				...TYPE_NOT_FOUND,
				details: 'House Not Found',
			},
		});

	return AppDataSource.manager
		.getRepository(House)
		.createQueryBuilder()
		.leftJoinAndSelect('property', 'property')
		.softDelete()
		.where('property.id =:pid', { pid })
		.andWhere('id =:hid', { hid })
		.execute()
		.then(
			() =>
				new ResponseAndLoggerWrapper({
					req,
					res,
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
