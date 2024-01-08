import { z } from 'zod'

export const envSchema = z.object({
  APP_PORT: z.coerce.number().default(3333),
  POSTGRES_URL: z.string(),
  DATABASE_SCHEMA: z.string().default('public'),
  DEFAULT_ADMIN_PASSWORD: z.string(),
  JWT_PRIVATE_KEY: z.string(),
  JWT_PUBLIC_KEY: z.string(),
  CLOUDFLARE_ACCOUNT_ID: z.string(),
  AWS_BUCKET_NAME: z.string(),
  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
  AWS_BUCKET_PUBLIC_URL: z.string(),
  EMAIL_HOST: z.string(),
  EMAIL_PORT: z.coerce.number(),
  EMAIL_USERNAME: z.string(),
  EMAIL_PASSWORD: z.string(),
})

export type Env = z.infer<typeof envSchema>
