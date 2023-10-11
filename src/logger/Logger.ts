import * as fs from 'fs';

import { responseWrapper, sendMail } from '../utils/common';
import {
	ClassLogerType,
	LoggerClassInterface,
	responseInterface,
} from '../types';
import { Request } from 'express';
import { DevLogsTemplate } from '../templates';

export class ResponseAndLoggerWrapper implements LoggerClassInterface {
	// logPathFile = `${path.parse(__dirname).root}logs/err.logs`;
	logPathFile = `${__dirname}/err.logs`;
	TYPE: responseInterface;
	err: Error | TypeError;
	req: Request;

	constructor({ res, payload, err, req }: ClassLogerType) {
		if (err) this.err = err;
		this.TYPE = payload;
		this.req = req;

		// if the error is server or internal error  send mail to dev
		if (payload.status >= 500 && payload.status <= 600) this.logToFile();

		responseWrapper(res, { ...payload });
	}

	async sendLoggerMail({ description }: { description: string }) {
		sendMail({
			subject: `Logger Error@${process.env.COMPANY_NAME}`,
			email_addr: process.env.DEV_MAIL,
			template: DevLogsTemplate({
				last_name: 'Morph',
				msg: description,
				first_name: 'Dev',
			}),
		});
	}

	// log to file
	async logToFile() {
		// get current Date and time
		const DateTime = new Date();

		const msg = `${DateTime.toLocaleDateString('en-US', {
			second: 'numeric',
			minute: 'numeric',
			year: 'numeric',
			month: 'short',
			hour12: false,
		})} [${this.req.ips}:${this.req.originalUrl}] ${this.TYPE.type}: Message->${
			this.err?.message
		}: Stack->${this.err?.stack} \n`;

		fs.access(this.logPathFile, fs.constants.F_OK, (err) =>
			err
				? fs.promises.writeFile(this.logPathFile, msg).then().catch(console.log)
				: fs.promises
						.appendFile(this.logPathFile, msg)
						.then()
						.catch(console.log)
		);

		// send mail to dev
		this.sendLoggerMail({
			description: msg,
		});
	}
}
