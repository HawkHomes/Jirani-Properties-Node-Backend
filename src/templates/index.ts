import { emailTemplateType } from '../types';

export const AccountNew = ({
	first_name,
	last_name,
	otp,
}: emailTemplateType) => `<div styles="color:red;">
Hello <h4 style="display:inline;">${first_name} ${last_name}</h4>, Welcome to ${
	process.env.COMPANY_NAME
}, we are excited to have you on board.
Here is your <a href='${
	process.env.FRONTEND_CLIENT ?? 'http://localhost:4000/api/'
}otp?otp=${otp}'>account activation link</a> to activate your account.
The Link expires in the next 1 hour, use the link before it expires
</div>`;

export const AccountPassword = ({
	first_name,
	last_name,
	otp: resetToken,
}: emailTemplateType) => `<div styles="color:red;">
Hello <h4 style="display:inline;">${first_name} ${last_name}</h4>, we have received a password reset for your ${process.env.COMPANY_NAME} account. Click <a href='${process.env.FRONTEND_CLIENT}change-password/${resetToken}'>here</a> to  reset your account password. If you didn't request for a password reset, ignore this email and don't share it with anyone.  This link will be invalid in the next 1 hour, use it before it expires</div>`;

export const DevLogsTemplate = ({
	first_name,
	last_name,
	msg,
}: emailTemplateType) =>
	`Hello Dev(${first_name} ${last_name}), new Error here: ${msg}`;
