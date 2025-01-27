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
