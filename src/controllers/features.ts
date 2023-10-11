import { Equal, TypeORMError } from 'typeorm';
import { Request, Response } from 'express';

import {
	TYPE_INTERNAL_ERROR,
	TYPE_ITEM_CREATED,
	TYPE_BAD_REQUEST,
	TYPE_NOT_FOUND,
	TYPE_OK,
	TYPE_NO_CONTENT,
} from '../utils/constants';
import { AppDataSource } from '../data-source';
import { Feature } from '../entity/Feature';
import { ResponseAndLoggerWrapper } from '../logger/Logger';

// #create feature
export const createFeature: (
	req: Request,
	res: Response
) => Promise<any> = async (req, res) => {
	const { name } = req.body;

	const findFeature = await AppDataSource.manager.findOne(Feature, {
		where: { name },
	});

	if (findFeature)
		return new ResponseAndLoggerWrapper({
			req,
			res,
			payload: {
				...TYPE_BAD_REQUEST,
				details: 'Feature Already Exists',
			},
		});

	const featureInstance = new Feature();

	featureInstance.name = name;

	return AppDataSource.manager
		.save(featureInstance)
		.then(
			(savedCategory) =>
				new ResponseAndLoggerWrapper({
					res,
					req,
					payload: {
						data: savedCategory,
						...TYPE_ITEM_CREATED,
					},
				})
		)
		.catch(
			(err: TypeORMError) =>
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

// update feature
export const updateFeature: (
	req: Request,
	res: Response
) => Promise<any> = async (req, res) => {
	const { name } = req.body;
	const { id } = req.params;

	const findFeature = await AppDataSource.manager.findOne(Feature, {
		where: { id },
	});

	if (!findFeature)
		return new ResponseAndLoggerWrapper({
			req,
			res,
			payload: {
				...TYPE_NOT_FOUND,
				details: 'Feature not found',
			},
		});

	return AppDataSource.manager
		.update(Feature, { id }, { name })
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

export const getFeature: (req: Request, res: Response) => Promise<any> = async (
	req,
	res
) => {
	const { id } = req.params;

	return AppDataSource.manager
		.findOne(Feature, {
			where: {
				id: Equal(id),
			},
		})
		.then(
			(data) =>
				new ResponseAndLoggerWrapper({
					res,
					req,
					payload: data
						? {
								...TYPE_OK,
								data,
						  }
						: {
								...TYPE_NOT_FOUND,
								details: 'The category you are looking for was not found',
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
						details: 'Matlformed or invalid parameters provided',
					},
				})
		);
};

// get all Features
export const getAllFeatures: (
	req: Request,
	res: Response
) => Promise<any> = async (req, res) => {
	const { name, page = 1, limit = 10, sort } = req.query;

	const manager = AppDataSource.manager
		.getRepository(Feature)
		.createQueryBuilder('feature');

	if (name)
		manager.where('feature.name ILIKE :featureName', {
			featureName: `%${name}%`,
		});

	if (sort)
		manager.orderBy(
			'feature.name',
			String(sort).toLowerCase() === 'ASC' ? 'ASC' : 'DESC'
		);

	return manager
		.take(parseInt(`${limit}`))
		.skip((parseInt(page as string) - 1) * parseInt(limit as string))
		.getManyAndCount()
		.then(
			([data, count]) =>
				new ResponseAndLoggerWrapper({
					req,
					res,
					payload: {
						data: { data, count },
						...TYPE_OK,
					},
				})
		)
		.catch(
			(err: Error) =>
				new ResponseAndLoggerWrapper({
					err,
					req,
					res,
					payload: {
						...TYPE_BAD_REQUEST,
					},
				})
		);
};

// delete feature
export const removeFeature: (
	req: Request,
	res: Response
) => Promise<any> = async (req, res) => {
	const { id } = req.params;

	const feature = await AppDataSource.manager.findOne(Feature, {
		where: { id },
	});

	if (!feature)
		return new ResponseAndLoggerWrapper({
			res,
			req,
			payload: {
				...TYPE_NOT_FOUND,
				details: 'Feature not found',
			},
		});

	return AppDataSource.manager
		.delete(Feature, {
			id,
		})
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
					payload: {
						...TYPE_INTERNAL_ERROR,
					},
				})
		);
};
