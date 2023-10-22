import { Request, Response } from 'express';
import { TypeORMError } from 'typeorm';

import {
	TYPE_INTERNAL_ERROR,
	TYPE_ITEM_CREATED,
	TYPE_NOT_FOUND,
} from './../utils/constants';
import { AppDataSource } from './../data-source';
import { Property } from './../entity/Property';
import { Review } from '../entity/Review';
import { User } from './../entity/User';
import { ResponseAndLoggerWrapper } from '../logger/Logger';

export const createReview: (
	req: Request,
	res: Response
) => Promise<any> = async (req, res) => {
	const { pid } = req.params;

	const { rating, review } = req.body;

	const owner = await AppDataSource.getRepository(User)
		.createQueryBuilder('user')
		.where('user.id =:id', { id: req.user.id })
		.getOne();

	const property = await AppDataSource.getRepository(Property)
		.createQueryBuilder('property')
		.where('property.id =:pid', { pid })
		.getOne();

	if (!property)
		return new ResponseAndLoggerWrapper({
			res,
			req,
			payload: {
				...TYPE_NOT_FOUND,
				details: 'Property not found',
			},
		});

	const newReview = new Review();
	newReview.property = property;
	newReview.review = review;
	newReview.rating = rating;
	newReview.owner = owner;

	return AppDataSource.manager
		.save(newReview)
		.then(
			(payload) =>
				new ResponseAndLoggerWrapper({
					res,
					req,
					payload: {
						...TYPE_ITEM_CREATED,
						data: newReview,
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
