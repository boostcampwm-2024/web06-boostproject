require('dotenv').config();

module.exports = [
  {
    name: 'harmony-api',
    script: 'apps/server/dist/src/main.js',
    instances: 2,
    exec_mode: 'cluster',
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
      OBJECT_STORAGE_ACCESS_KEY: process.env.OBJECT_STORAGE_ACCESS_KEY,
      OBJECT_STORAGE_SECRET_KEY: process.env.OBJECT_STORAGE_SECRET_KEY,
      OBJECT_STORAGE_REGION: process.env.OBJECT_STORAGE_REGION,
      OBJECT_STORAGE_BUCKET_NAME: process.env.OBJECT_STORAGE_BUCKET_NAME,
      OBJECT_STORAGE_ENDPOINT: process.env.OBJECT_STORAGE_ENDPOINT,
    },
  },
];
