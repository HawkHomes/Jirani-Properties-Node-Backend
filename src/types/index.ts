import { NextFunction, Request, Response } from 'express';
import { Perm } from '../entity/Perm';

export interface responseInterface {
	status: number;
	details?: string;
	type: string;
	title: string;
	data?: any;
}
export enum roleInterface {
	AdminAgent = 'AdminAgent',
	Agent = 'Agent',
	Admin = 'Admin',
	USER = 'User',
}

export enum assetStatus {
	ForAuction = 'Auction',
	Upcoming = 'Upcoming',
	ForRent = 'Rent',
	ForSale = 'Sale',
	Sold = 'Sold',
}

export interface userProfileInterface {
	email_addr: string;
	avatar: string;
	phone?: string;
	kra_pin?: string;
	id_no?: number;
	id?: string;
}

interface commonUser {
	first_name: string;
	last_name: string;
}

export interface emailInterface
	extends Pick<userProfileInterface, 'email_addr'> {
	template: string;
	subject: string;
}

export interface emailTemplateType extends commonUser {
	otp?: number | string;
	msg?: string;
}
export interface agencyInterface {
	date_updated: Date;
	website_url: string;
	date_added: Date;
	address: string;
	licence: string;
	phone: string;
	name: string;
	id: string;
}

export interface userInterface extends commonUser {
	profile: userProfileInterface;
	agency?: agencyInterface;
	is_landlord: boolean;
	password?: string;
	perm: Perm;
	id: string;
}

export interface PasswordResetInterface
	extends Pick<userInterface, 'password'> {
	token: string;
}

export interface smsInterface extends Pick<userProfileInterface, 'phone'> {
	msg: string;
}

export interface min_max_builtInterface {
	max?: number;
	min?: number;
}

export interface coordsInterface {
	long: number;
	lat: number;
}

export interface propertyInterface<L = min_max_builtInterface, T = string> {
	coordinates: coordsInterface;
	additional_info: string;
	nearest_town: string;
	status: assetStatus;
	year_built: number;
	features: string[];
	photos: string[];
	address: string;
	agency: string;
	name: string;
	land_size: L;
	type: T;
}

export enum dataOrderingEnum {
	Descending = 'DESC',
	Ascending = 'ASC',
}

export enum propertyTypeEnum {
	Family = 'Family',
}

export interface paginationInterface {
	page: number;
	limit: number;
}

export interface propertyFilterInterface
	extends paginationInterface,
		Omit<propertyInterface<min_max_builtInterface, string[]>, 'year_built'> {
	year_built: min_max_builtInterface;
	sort: dataOrderingEnum;
	id: string;
	// radius in meters
	radius: number;
	currLocation: {
		long: string;
		lat: string;
	};
}
export interface houseFilterInterface extends propertyFilterInterface {
	cost: min_max_builtInterface;
	total_available: number;
	status: assetStatus;
	category: string[];
}

export interface otpInterface {
	otp?: number;
}

export type controllerFunctionInterface = (
	params: controllerInterface
) => Promise<any>;

export interface controllerInterface {
	next?: NextFunction;
	req: Request;
	res: Response;
}

export interface dirFileReaderParamsInterface {
	defaultExport?: boolean;
	baseRoute: string;
	ignoreFiles: string[];
	array?: boolean;
}

export interface dynamicKeysInterface<T> {
	[key: string]: T;
}

export interface dirFileReaderInterface {
	(parms: dirFileReaderParamsInterface):
		| dynamicKeysInterface<string>
		| string[];
}

export interface queryParamEncoderInterface {
	params:
		| dynamicKeysInterface<
				| dynamicKeysInterface<Number | Boolean | String>
				| Array<Number | String>
				| Number
				| Boolean
				| String
		  >
		| Boolean
		| Number
		| String;
	currIter?: number;
	prevKey?: null | string;
}

export type LoggerClassInterface = {
	// properties
	TYPE: responseInterface;
	err?: Error | TypeError;
	logPathFile: string;

	// methods
	sendLoggerMail: ({ description }: { description?: string }) => string | any;
	logToFile: () => string | any;
};

export type ClassLogerType = {
	payload: responseInterface;
	res: Response;
	req: Request;
} & Pick<LoggerClassInterface, 'err'>;

export type OptionalValidatorType = {
	// uuid field found in body
	specialParamInBody?: boolean;
	maxValue?: number | null;
	dependsOnField?: string;
	minValue?: number | null;
	signInChain?: boolean;
	queryString: boolean;
	targetField: string;
	optional: boolean;
	msg?: string;
};
