import 'dotenv/config';

export const apps = [
	{
		name: 'harmony-api',
		script: 'apps/server/dist/src/main.js',
		env: {
			NODE_ENV: 'production',
		},
		env_production: {
			DATABASE_HOST: process.env.DATABASE_HOST,
			DATABASE_PORT: process.env.DATABASE_PORT,
			DATABASE_NAME: process.env.DATABASE_NAME,
			DATABASE_PASSWORD: process.env.DATABASE_PASSWORD,
			DATABASE_USER: process.env.DATABASE_USER,
			JWT_ACCESS_TOKEN_SECRET: process.env.JWT_ACCESS_TOKEN_SECRET,
			JWT_ACCESS_TOKEN_TIME: process.env.JWT_ACCESS_TOKEN_TIME,
			JWT_REFRESH_TOKEN_SECRET: process.env.JWT_REFRESH_TOKEN_SECRET,
			JWT_REFRESH_TOKEN_TIME: process.env.JWT_REFRESH_TOKEN_TIME,
		},
	},
];
