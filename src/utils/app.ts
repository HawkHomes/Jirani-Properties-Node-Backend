import * as compression from 'compression';
import * as morgan from 'morgan';
import { Express } from 'express';
import helmet from 'helmet';
import * as cors from 'cors';

const express = require('express');
const app: Express = express();

app.use(express.json({}));

// add payload compression
app.use(compression());

app.use(morgan('tiny'));

app.set('trust proxy', true);

app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));

// add cors
app.use(
	cors({
		// origin: ['localhost:3000'],
	})
);

export default app;
