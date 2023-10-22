import { ILike, TypeORMError } from 'typeorm';
import { Request, Response } from 'express';

import {
	TYPE_ITEM_CREATED,
	TYPE_NO_CONTENT,
	TYPE_BAD_REQUEST,
	TYPE_NOT_FOUND,
	TYPE_INTERNAL_ERROR,
	TYPE_OK,
} from './../utils/constants';
import { PropertyType } from '../entity/PropertyType';
import { AppDataSource } from '../data-source';
import { ResponseAndLoggerWrapper } from '../logger/Logger';

// #create acc
export const createPropertyType: (
	req: Request,
	res: Response
) => Promise<any> = async (req, res) => {
	const { name } = req.body;

	const propertyTypeFound = await AppDataSource.manager.findOne(PropertyType, {
		where: { name },
	});

	if (propertyTypeFound)
		return new ResponseAndLoggerWrapper({
			req,
			res,
			payload: {
				...TYPE_BAD_REQUEST,
				details: `Property Type ${name} already exists`,
			},
		});

	const newPropertyType = new PropertyType();

	newPropertyType.name = name;

	return AppDataSource.manager
		.save(newPropertyType)
		.then((savedPropertyType) => {
			delete savedPropertyType?.date_deleted;

			return new ResponseAndLoggerWrapper({
				req,
				res,
				payload: {
					data: savedPropertyType,
					...TYPE_ITEM_CREATED,
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

// update account
export const updatePropertyType: (
	req: Request,
	res: Response
) => Promise<any> = async (req, res) => {
	const { name } = req.body;
	const { id } = req.params;

	const propertyTypeFound = await AppDataSource.manager.findOne(PropertyType, {
		where: { id },
	});

	if (!propertyTypeFound)
		return new ResponseAndLoggerWrapper({
			res,
			req,
			payload: {
				...TYPE_NOT_FOUND,
				details: 'Item nof found',
			},
		});

	return AppDataSource.manager
		.update(PropertyType, { id }, { name })
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

export const getSinglePropertyTypes: (
	req: Request,
	res: Response
) => Promise<any> = async (req, res) => {
	const { id } = req.params;

	return AppDataSource.manager
		.getRepository(PropertyType)
		.createQueryBuilder('propertytype')
		.where('propertytype.id =:id', { id })
		.getOne()
		.then(
			(propertyType) =>
				new ResponseAndLoggerWrapper({
					req,
					res,
					payload: propertyType
						? {
								...TYPE_OK,
								data: propertyType,
						  }
						: {
								...TYPE_NOT_FOUND,
								details: `Property Type not found`,
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

// get all propertyTypes
export const getAllPropertyTypes: (
	req: Request,
	res: Response
) => Promise<any> = async (req, res) => {
	const { name, page = 1, limit = 10, sort } = req.query;

	return AppDataSource.manager
		.findAndCount(PropertyType, {
			where: {
				...(name ? { name: ILike(`%${name as string}%`) } : {}),
			},
			...(page
				? { skip: (parseInt(page as string) - 1) * parseInt(limit as string) }
				: {}),
			...(limit ? { take: parseInt(limit as string) } : {}),
			order: {
				name: 'ASC',
			},
		})
		.then(
			([data, count]) =>
				new ResponseAndLoggerWrapper({
					res,
					req,
					payload: {
						data: { data, count },
						...TYPE_OK,
					},
				})
		)
		.catch(
			(err: Error) =>
				new ResponseAndLoggerWrapper({
					payload: TYPE_BAD_REQUEST,
					res,
					err,
					req,
				})
		);
};

// delete propertyType
export const removePropertyType: (
	req: Request,
	res: Response
) => Promise<any> = async (req, res) => {
	const { id } = req.params;

	const propertyTypeFound = await AppDataSource.manager.findOne(PropertyType, {
		where: { id },
	});

	if (!propertyTypeFound)
		return new ResponseAndLoggerWrapper({
			res,
			req,
			payload: {
				...TYPE_NOT_FOUND,
				details: 'Item nof found',
			},
		});

	return AppDataSource.manager
		.softDelete(PropertyType, {
			id,
		})
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
