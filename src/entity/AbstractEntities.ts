import { Column } from 'typeorm';

export abstract class OauthEntityClass {
	@Column({ name: 'oauth_provider', nullable: true, select: false })
	oauth_provider: string;

	@Column({ name: 'oauth_id', nullable: true, select: false })
	oauth_id: string;
}

export abstract class BaseClass {}
