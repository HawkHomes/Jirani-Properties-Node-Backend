import { Request } from 'express';

export const GraphQlMiddlewareContent: (
	req: Request,
	args: any
) => Promise<any> = async (
	req: Request, //Request,
	args
) => ({
	headers: req.headers,
});
