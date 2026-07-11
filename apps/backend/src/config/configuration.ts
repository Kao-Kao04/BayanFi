export const configuration = () => ({
  env: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '4000', 10),
  appUrl: process.env.APP_URL ?? 'http://localhost:3000',
  apiUrl: process.env.API_URL ?? 'http://localhost:4000',
  aiServiceUrl: process.env.AI_SERVICE_URL ?? 'http://localhost:8000',

  database: {
    url: process.env.DATABASE_URL,
  },

  // NOTE: Redis is not required for the MVP. Rate limiting uses in-memory
  // storage. Redis/queues are a Phase 2 scaling concern (see roadmap).

  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  },

  stellar: {
    network: process.env.STELLAR_NETWORK ?? 'testnet',
    horizonUrl: process.env.STELLAR_HORIZON_URL ?? 'https://horizon-testnet.stellar.org',
    networkPassphrase:
      process.env.STELLAR_NETWORK_PASSPHRASE ?? 'Test SDF Network ; September 2015',
    masterPublicKey: process.env.STELLAR_MASTER_PUBLIC_KEY,
    masterSecretKey: process.env.STELLAR_MASTER_SECRET_KEY,
    sorobanRpcUrl: process.env.SOROBAN_RPC_URL ?? 'https://soroban-testnet.stellar.org',
    // Threshold above which multisig is required (in asset units)
    multisigThreshold: parseFloat(process.env.STELLAR_MULTISIG_THRESHOLD ?? '1000'),
  },

  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS ?? '10', 10),
    encryptionKey: process.env.ENCRYPTION_KEY,
    maxLoginAttempts: 5,
    lockoutMinutes: 15,
  },

  ai: {
    openaiApiKey: process.env.OPENAI_API_KEY,
    openaiModel: process.env.OPENAI_MODEL ?? 'gpt-4-turbo-preview',
  },

  storage: {
    type: process.env.STORAGE_TYPE ?? 'local',
    localPath: process.env.STORAGE_LOCAL_PATH ?? './uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE ?? '10485760', 10),
  },

  features: {
    disasterMode: process.env.ENABLE_DISASTER_MODE === 'true',
    aiFeatures: process.env.ENABLE_AI_FEATURES === 'true',
    merchantSystem: process.env.ENABLE_MERCHANT_SYSTEM === 'true',
  },
});

export type AppConfig = ReturnType<typeof configuration>;
