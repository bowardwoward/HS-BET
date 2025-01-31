import { Logger } from '@nestjs/common';
import { z } from 'zod';

export const envSchema = z.object({
  CBS_ENDPOINT: z.string().url(),
  API_USERNAME: z.string().min(1),
  API_PASSWORD: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  MAIL_MAILER: z.enum(['smtp']),
  MAIL_HOST: z.string().min(1),
  MAIL_PORT: z.string().or(z.number()).transform(Number),
  MAIL_USERNAME: z.string(),
  MAIL_PASSWORD: z.string(),
  EMAIL_PASSWORD_RESET_URL: z.string(),
  MAIL_FROM_ADDRESS: z.string().email(),
  DB_TYPE: z
    .enum(['postgres', 'mysql', 'mariadb', 'sqlite', 'mssql'])
    .default('postgres'),
  PG_USER: z.string().min(1),
  PG_PASSWORD: z.string().min(1),
  PG_HOST: z.string().min(1),
  PG_PORT: z.string().or(z.number()).transform(Number),
  PG_DB: z.string().min(1),
  NODE_ENV: z.enum(['development', 'production', 'local']),
});

export type Env = z.infer<typeof envSchema>;

// Validate environment variables
const validateEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    new Logger().error('❌ Invalid environment variables:', error);
    process.exit(1);
  }
};

export const env = validateEnv();
