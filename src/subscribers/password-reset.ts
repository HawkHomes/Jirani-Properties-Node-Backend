import { randomBytes } from 'crypto';
import {
	EntitySubscriberInterface,
	EventSubscriber,
	InsertEvent,
	RemoveEvent,
	UpdateEvent,
} from 'typeorm';

import { PasswordReset } from '../entity/PasswordReset';
import {
	deleteOutdatedPasswordRecords,
	sendMail,
	sendSms,
} from '../utils/common';
import { AccountPassword } from '../templates';

const bcrypt = require('bcrypt');

@EventSubscriber()
export class PasswordResetSubscriber
	implements EntitySubscriberInterface<PasswordReset>
{
	listenTo(): string | Function {
		return PasswordReset;
	}

	beforeInsert(event: InsertEvent<PasswordReset>): void | Promise<any> {
		const { entity: passwordResetEntity } = event;
		passwordResetEntity.token = randomBytes(16).toString('hex');
	}

	beforeUpdate(event: UpdateEvent<PasswordReset>): void | Promise<any> {
		const { entity: passwordResetEntity } = event;

		const findUpdatedToken = event.updatedColumns.find(
			({ propertyName }) => propertyName === 'token'
		);

		if (findUpdatedToken)
			passwordResetEntity.token = randomBytes(16).toString('hex');
	}

	// custom methods for event triggers

	afterRemove(event: RemoveEvent<PasswordReset>): void | Promise<any> {}

	afterUpdate(event: UpdateEvent<PasswordReset>): void | Promise<any> {
		const { entity: passwordResetEntity } = event;

		deleteOutdatedPasswordRecords();

		const findUpdatedToken = event.updatedColumns.find(
			({ propertyName }) => propertyName === 'token'
		);

		if (findUpdatedToken) {
			sendSms({
				msg: `We have received an account reset request for your  ${process.env.COMPANY_NAME}'s account click here if you made the request http://localhost:4000/. If you didn't make the request, then ignore this message and don't send it to anyone.`,
				phone: passwordResetEntity.user.profile.phone,
			});

			return sendMail({
				template: AccountPassword({
					first_name: passwordResetEntity.user.first_name,
					last_name: passwordResetEntity.user.last_name,
					otp: passwordResetEntity.token,
				}),
				subject: `${process.env.COMPANY_NAME} Password reset`,
				email_addr: passwordResetEntity.user.profile.email_addr,
			});
		}
	}

	afterInsert(event: InsertEvent<PasswordReset>): void | Promise<any> {
		const { entity: passwordResetEntity } = event;

		deleteOutdatedPasswordRecords();

		sendSms({
			msg: `We have received an account reset request for your  ${process.env.COMPANY_NAME}'s account click here if you made the request http://localhost:4000/. If you didn't make the request, then ignore this message and don't send it to anyone.`,
			phone: passwordResetEntity.user.profile.phone,
		});

		return sendMail({
			template: AccountPassword({
				first_name: passwordResetEntity.user.first_name,
				last_name: passwordResetEntity.user.last_name,
				otp: passwordResetEntity.token,
			}),
			subject: `${process.env.COMPANY_NAME} Password reset`,
			email_addr: passwordResetEntity.user.profile.email_addr,
		});
	}
}
