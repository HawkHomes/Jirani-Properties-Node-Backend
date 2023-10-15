import { Point, TypeORMError } from 'typeorm';
import { Request, Response } from 'express';

import { AppDataSource } from './../data-source';

import {
	TYPE_INTERNAL_ERROR,
	TYPE_ITEM_CREATED,
	TYPE_BAD_REQUEST,
	TYPE_NO_CONTENT,
	TYPE_OK,
	TYPE_NOT_FOUND,
} from './../utils/constants';
import { Agency } from '../entity/Agency';
import { ResponseAndLoggerWrapper } from '../logger/Logger';
import { getWKTCoords } from '../utils/common';

// #create acc
export const createAgency: (
	req: Request,
	res: Response
) => Promise<any> = async (req, res) => {
	const {
		coordinates,
		website_url,
		licence = '',
		address,
		avatar,
		phone,
		name,
	} = req.body;

	const formatedCoordinates = getWKTCoords({
		long: parseFloat(`${coordinates.long}`),
		lat: parseFloat(`${coordinates.lat}`),
	});

	const foundAgency = await AppDataSource.manager
		.getRepository(Agency)
		.createQueryBuilder('agency')
		.where('agency.name =:name', { name })
		.andWhere('agency.phone =:phone', { phone })
		.andWhere(
			'ST_DWithin(agency.coords, ST_MakePoint(:long,:lat)::geography,:radius)',
			{
				long: formatedCoordinates.coordinates[0],
				lat: formatedCoordinates.coordinates[1],
				radius: 0,
			}
		) //check for location information for comparison.
		.getOne();

	if (foundAgency)
		return new ResponseAndLoggerWrapper({
			req,
			res,
			payload: {
				...TYPE_BAD_REQUEST,
				details: `Agency ${name} already registered`,
			},
		});

	const coords: Point = {
		coordinates: [coordinates.long, coordinates.lat],
		type: 'Point',
	};

	const agency = new Agency();

	agency.website_url = website_url;
	agency.address = address;
	agency.avatar = avatar;
	agency.licence = licence;
	agency.coords = coords;
	agency.phone = phone;
	agency.name = name;
	agency.website_url;

	return AppDataSource.manager
		.save(agency)
		.then(
			(savedAgency) =>
				new ResponseAndLoggerWrapper({
					res,
					req,
					payload: {
						...TYPE_ITEM_CREATED,
						data: savedAgency,
					},
				})
		)
		.catch(
			(err: TypeORMError) =>
				new ResponseAndLoggerWrapper({
					req,
					res,
					err,
					payload: {
						...TYPE_INTERNAL_ERROR,
						details: err.message,
					},
				})
		);
};

// update account
export const updateAgency: (
	req: Request,
	res: Response
) => Promise<any> = async (req, res) => {
	const { id } = req.params;
	const { name, address, phone, website_url, licence } = req.body;

	const payload = {
		...(website_url ? { website_url } : {}),
		...(address ? { address } : {}),
		...(licence ? { licence } : {}),
		...(phone ? { phone } : {}),
		...(name ? { name } : {}),
	};

	return AppDataSource.manager
		.update(
			Agency,
			{
				id,
			},
			{
				// update payload
				...payload,
			}
		)
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
					req,
					err,
					res,
					payload: {
						...TYPE_INTERNAL_ERROR,
					},
				})
		);
};

// get all agencies
export const getAllAgencies: (
	req: Request,
	res: Response
) => Promise<any> = async (req, res) => {
	const { page = 1, limit = 10, name, id, phone } = req.query;

	const manager = AppDataSource.manager
		.getRepository(Agency)
		.createQueryBuilder('agency')
		.leftJoinAndSelect('agency.properties', 'properties')
		.leftJoinAndSelect('properties.houses', 'houses');

	if (name) manager.where('agency.name ILIKE :name', { name: `%${name}%` });
	if (id) manager.andWhere('agency.id =:agencyId', { agencyId: id });
	if (phone) manager.andWhere('agency.phone =:phone', { phone });

	return manager
		.orderBy('agency.date_added', 'DESC')
		.skip((parseInt(`${page}`) - 1) * parseInt(`${limit}`))
		.take(parseInt(`${limit}`))
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
					req,
					err,
					payload: {
						...TYPE_BAD_REQUEST,
					},
				})
		);
};

export const getAgency: (req: Request, res: Response) => Promise<any> = async (
	req,
	res
) => {
	const { id } = req.params;

	return AppDataSource.manager
		.getRepository(Agency)
		.createQueryBuilder('agency')
		.where('agency.id =:id', { id: String(id) })
		.leftJoinAndSelect('agency.properties', 'properties')
		.getOne()
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
								details: 'The agency you are looking for was not found',
						  },
				})
		)
		.catch(
			(err: Error) =>
				new ResponseAndLoggerWrapper({
					err,
					res,
					req,
					payload: {
						...TYPE_BAD_REQUEST,
						details: 'Matlformed or invalid parameters provided',
					},
				})
		);
};

// delete agency, check this
export const deleteAgency: (
	req: Request,
	res: Response
) => Promise<any> = async (req, res) => {
	const { id } = req.params;

	AppDataSource.getRepository(Agency)
		.createQueryBuilder('agency')
		.where('id =:id', { id })
		.softDelete()
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
					req,
					err,
					res,
					payload: {
						...TYPE_INTERNAL_ERROR,
					},
				})
		);
};
