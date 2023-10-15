import { AppDataSource } from '../data-source';
import { roleInterface } from '..//types/';
import { Profile } from '../entity/Profile';
import { Perm } from '../entity/Perm';
import { User } from '../entity/User';
import { Agency } from '../entity/Agency';
import { Point } from 'typeorm';

export const createRoles = async () => {
	//admin
	const foundAdmin = await AppDataSource.manager.findOne(Perm, {
		where: {
			role: roleInterface.Admin,
		},
	});

	if (!foundAdmin) {
		const role1 = new Perm();
		role1.role = roleInterface.Admin;
		await AppDataSource.manager.save(role1);
	}

	//landlord
	const foundAgent = await AppDataSource.manager.findOne(Perm, {
		where: {
			role: roleInterface.Agent,
		},
	});

	if (!foundAgent) {
		const role2 = new Perm();
		role2.role = roleInterface.Agent;
		await AppDataSource.manager.save(role2);
	}

	// user
	const foundUser = await AppDataSource.manager.findOne(Perm, {
		where: {
			role: roleInterface.USER,
		},
	});

	if (!foundUser) {
		const role3 = new Perm();
		role3.role = roleInterface.USER;
		await AppDataSource.manager.save(role3);
	}
};

export const createDefaultUser = async () => {
	const email_addr = 'duncansantiago18@gmail.com';

	const userExists = await AppDataSource.manager
		.getRepository(User)
		.createQueryBuilder('user')
		.leftJoinAndSelect('user.profile', 'profile')
		.where('profile.email_addr =:email_addr', { email_addr })
		.getOne();

	if (userExists) return;

	//admin
	const adminPerm = await AppDataSource.manager
		.getRepository(Perm)
		.createQueryBuilder('perm')
		.where('perm.role =:role', {
			role: roleInterface.Admin,
		})
		.getOne();

	if (!adminPerm) return;

	const foundAgency = await AppDataSource.manager
		.getRepository(Agency)
		.createQueryBuilder('agency')
		.where('agency.name =:name', {
			name: process.env.COMPANY_NAME,
		})
		.getOne();

	const defaultUser = new User();

	const prof = new Profile();

	prof.email_addr = email_addr;
	prof.phone = '254797494509';
	prof.kra_pin = '';
	prof.id_no = 0;

	defaultUser.profile = prof;
	defaultUser.perm = adminPerm;

	defaultUser.agency = foundAgency;
	defaultUser.first_name = 'Morph';
	defaultUser.last_name = 'Morph';
	defaultUser.password = '1100111';
	defaultUser.verified = true;
	defaultUser.active = true;

	return AppDataSource.manager
		.save(defaultUser)
		.then((payload) => delete payload.password)
		.catch(console.log);
};

export const createDefaultAgency = async () => {
	const foundAgency = await AppDataSource.manager
		.getRepository(Agency)
		.createQueryBuilder('agency')
		.where('agency.name =:name', {
			name: process.env.COMPANY_NAME,
		})
		.getOne();

	const coords: Point = {
		coordinates: [0, 0],
		type: 'Point',
	};

	if (!foundAgency) {
		const newAgencyPayload = {
			address: 'Ronald Ngala Strt, Along Moi Avenue',
			name: process.env.COMPANY_NAME,
			website_url: 'jirani.vercel.app',
			phone: '254797494509',
			licence: '',
			coords,
		};

		return AppDataSource.createQueryBuilder()
			.insert()
			.into(Agency)
			.values(newAgencyPayload)
			.execute()
			.catch(console.log);
	} else return;
};
