import {
	EntitySubscriberInterface,
	EventSubscriber,
	InsertEvent,
	UpdateEvent,
} from 'typeorm';

import { awsSendMail, generateOtp, sendSms } from '../utils/common';
import { ActivateAccount } from '../entity/Activate';
import { User } from '../entity/User';
import { AccountNew } from '../templates';

const bcrypt = require('bcrypt');

@EventSubscriber()
export class UserSub implements EntitySubscriberInterface<User> {
	listenTo(): string | Function {
		return User;
	}

	// custom methods for event triggers
	beforeInsert(event: InsertEvent<User>): void | Promise<any> {
		const { entity: userEntity } = event;
		if (userEntity.oauth_provider) return;

		const hash = bcrypt.hashSync(userEntity.password, bcrypt.genSaltSync(10));
		userEntity.password = hash;
	}

	beforeUpdate(event: UpdateEvent<User>): void | Promise<any> {
		const { entity: userEntity } = event;

		const findPassword = event.updatedColumns.find(
			({ propertyName }) => propertyName === 'password'
		);

		if (findPassword) {
			const hash = bcrypt.hashSync(userEntity.password, bcrypt.genSaltSync(10));
			userEntity.password = hash;
		}
	}

	afterInsert(event: InsertEvent<User>): void | Promise<any> {
		const manager = event.manager;

		const { entity: userEntity } = event;

		if (userEntity.oauth_provider) return;

		const acc = new ActivateAccount();
		acc.otp = generateOtp();
		acc.user = userEntity;

		return manager
			.save(acc)
			.then(() => {
				sendSms({
					msg: `Your  ${process.env.COMPANY_NAME} OTP is ${acc.otp}`,
					phone: userEntity.profile.phone,
				});

				// return sendMail({
				// 	template: AccountNew({
				// 		first_name: userEntity.first_name,
				// 		last_name: userEntity.last_name,
				// 		otp: acc.otp,
				// 	}),
				// 	subject: `${process.env.COMPANY_NAME} Account Activation`,
				// 	email_addr: userEntity.profile.email_addr,
				// });

				return awsSendMail({
					template: AccountNew({
						first_name: userEntity.first_name,
						last_name: userEntity.last_name,
						otp: acc.otp,
					}),
					subject: `${process.env.COMPANY_NAME} Account Activation`,
					email_addr: userEntity.profile.email_addr,
				});
			})
			.catch(console.log);
	}
}
