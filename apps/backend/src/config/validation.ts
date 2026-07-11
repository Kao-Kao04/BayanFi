import * as Joi from 'joi';

/**
 * Environment variable validation schema.
 * Fails fast on boot if required config is missing or malformed.
 */
export const validationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'staging', 'production', 'test').default('development'),
  PORT: Joi.number().default(4000),

  DATABASE_URL: Joi.string().required(),

  // Redis is optional and unused in the MVP (in-memory rate limiting).
  REDIS_HOST: Joi.string().allow('').optional(),
  REDIS_PORT: Joi.number().allow('').optional(),
  REDIS_PASSWORD: Joi.string().allow('').optional(),

  JWT_SECRET: Joi.string().min(16).required(),
  JWT_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_SECRET: Joi.string().min(16).required(),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),

  STELLAR_NETWORK: Joi.string().valid('testnet', 'mainnet').default('testnet'),
  STELLAR_HORIZON_URL: Joi.string().uri().required(),
  STELLAR_NETWORK_PASSPHRASE: Joi.string().required(),
  STELLAR_MASTER_PUBLIC_KEY: Joi.string().length(56).optional(),
  STELLAR_MASTER_SECRET_KEY: Joi.string().length(56).optional(),

  ENCRYPTION_KEY: Joi.string().min(32).required(),
  BCRYPT_ROUNDS: Joi.number().default(10),

  OPENAI_API_KEY: Joi.string().allow('').optional(),
  AI_SERVICE_URL: Joi.string().uri().default('http://localhost:8000'),
}).unknown(true);
