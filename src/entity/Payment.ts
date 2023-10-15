import { Entity } from 'typeorm';

import { BaseClass } from './AbstractEntities';

@Entity({ name: 'payment' })
export class Payment extends BaseClass {}
