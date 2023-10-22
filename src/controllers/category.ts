import { Equal, TypeORMError } from 'typeorm';
import { Request, Response } from 'express';

import { ResponseAndLoggerWrapper } from '../logger/Logger';
import { AppDataSource } from '../data-source';
import { Category } from '../entity/Category';
import {
	TYPE_INTERNAL_ERROR,
	TYPE_ITEM_CREATED,
	TYPE_BAD_REQUEST,
	TYPE_NOT_FOUND,
	TYPE_OK,
	TYPE_NO_CONTENT,
} from './../utils/constants';
import { dataOrderingEnum } from '../types';

// #create acc
export const createCategory: (
	req: Request,
	res: Response
) => Promise<any> = async (req, res) => {
	const { name } = req.body;

	const findCategory = await AppDataSource.manager
		.getRepository(Category)
		.createQueryBuilder('category')
		.where('category.name =:name', { name })
		.getOne();

	if (findCategory)
		return new ResponseAndLoggerWrapper({
			res,
			req,
			payload: {
				...TYPE_BAD_REQUEST,
				details: `Category ${name} already exists`,
			},
		});

	const newCategory = new Category();

	newCategory.name = name;

	return AppDataSource.manager
		.save(newCategory)
		.then(
			(savedCategory) =>
				new ResponseAndLoggerWrapper({
					res,
					req,
					payload: {
						...TYPE_ITEM_CREATED,
						data: savedCategory,
					},
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

export const getCategory: (
	req: Request,
	res: Response
) => Promise<any> = async (req, res) => {
	const { id } = req.params;

	return AppDataSource.manager
		.findOne(Category, {
			where: {
				...(id ? { id: Equal(id as string) } : {}),
			},
		})
		.then(
			(data) =>
				new ResponseAndLoggerWrapper({
					req,
					res,
					payload: {
						...(data
							? { data: { data }, ...TYPE_OK }
							: {
									...TYPE_NOT_FOUND,
									details: 'The category you are looking for was not found',
							  }),
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

// update account
export const updateCategory: (
	req: Request,
	res: Response
) => Promise<any> = async (req, res) => {
	const { name } = req.body;
	const { id } = req.params;

	const findCategory = await AppDataSource.manager
		.getRepository(Category)
		.createQueryBuilder('category')
		.where('category.name =:name', { name });

	if (!findCategory)
		return new ResponseAndLoggerWrapper({
			res,
			req,
			payload: {
				...TYPE_NOT_FOUND,
				details: `Category was not found`,
			},
		});

	return AppDataSource.manager
		.update(Category, { id }, { name })
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

// get all categories
export const getAllCategories: (
	req: Request,
	res: Response
) => Promise<any> = async (req, res) => {
	const {
		sort = dataOrderingEnum.Ascending,
		page = 1,
		limit = 10,
		name,
		id,
	} = req.query;

	const manager = AppDataSource.manager
		.getRepository(Category)
		.createQueryBuilder('category');

	if (name) manager.where('category.name ILIKE :name', { name: `%${name}%` });

	if (id)
		name
			? manager.andWhere('category.id =:id', { id })
			: manager.where('category.id =:id', { id });

	return manager
		.addOrderBy(
			'category.added_on',
			sort === dataOrderingEnum.Ascending ? 'ASC' : 'DESC'
		)
		.skip((parseInt(`${page}`) - 1) * parseInt(`${limit}`))
		.take(parseInt(`${limit}`))
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

// delete category
export const removeCategory: (
	req: Request,
	res: Response
) => Promise<any> = async (req, res) => {
	const { id } = req.params;

	const cat = await AppDataSource.manager.findOne(Category, { where: { id } });

	if (!cat)
		return new ResponseAndLoggerWrapper({
			req,
			res,
			payload: {
				...TYPE_NOT_FOUND,
				details: 'Item nof found',
			},
		});

	return AppDataSource.manager
		.delete(Category, {
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
