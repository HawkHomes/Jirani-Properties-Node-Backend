import { Column, Index, Point, PrimaryGeneratedColumn } from 'typeorm';

export abstract class BaseClass {
	@PrimaryGeneratedColumn('uuid')
	id: string;
}

export abstract class OauthEntityClass extends BaseClass {
	@Column({ name: 'oauth_provider', nullable: true, select: false })
	oauth_provider: string;

	@Column({ name: 'oauth_id', nullable: true, select: false })
	oauth_id: string;
}

export abstract class LocationEntity extends BaseClass {
	@Index({ spatial: true })
	@Column({ type: 'geometry', spatialFeatureType: 'Point', srid: 4326 })
	coords: Point;
}
