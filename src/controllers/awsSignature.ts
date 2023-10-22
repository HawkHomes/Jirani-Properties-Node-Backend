import {
	DeleteObjectsCommandInput,
	PutObjectCommandInput,
	S3Client,
} from '@aws-sdk/client-s3';
import { fromEnv } from '@aws-sdk/credential-provider-env';
import { Request, Response } from 'express';
import { randomBytes } from 'node:crypto';

import { ResponseAndLoggerWrapper } from '../logger/Logger';
import { awsBucketPut, awsDeleteItem } from '../utils/common';
import { TYPE_OK } from '../utils/constants';

export const getAwsPresignedUrl = async (req: Request, res: Response) => {
	const { no_img } = req.query;

	const client = new S3Client({
		credentials: fromEnv(),
		region: process.env.S3_REGION,
	});

	const configs: PutObjectCommandInput = {
		Bucket: 'jirani-assets',
		ContentType: 'image/*',
		Key: '',
	};

	return res.json({
		urls: await Promise.all(
			Array(parseInt(no_img as string))
				.fill(0)
				.map(async () =>
					awsBucketPut({
						s3: client,
						configs: {
							...configs,
							Key: await randomBytes(16).toString('hex'),
						},
					})
				)
		),
	});
};

export const deleteAwsObject = async (req: Request, res: Response) => {
	const { items }: { items: string[] } = req.body;

	const s3ClientCustom = new S3Client({
		credentials: fromEnv(),
		region: process.env.S3_REGION,
	});

	const configs: DeleteObjectsCommandInput = {
		Bucket: 'jirani-assets',

		Delete: {
			Objects: items.map((objectId) => ({ Key: objectId })),
		},
	};

	awsDeleteItem({ configs, s3: s3ClientCustom });

	return new ResponseAndLoggerWrapper({
		req,
		res,
		payload: {
			...TYPE_OK,
		},
	});
};
