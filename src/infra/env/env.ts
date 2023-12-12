import { z } from 'zod'

export const envSchema = z.object({
  APP_PORT: z.coerce.number().default(3333),
  POSTGRES_URL: z.string(),
  DATABASE_SCHEMA: z.string().default('public'),
  DEFAULT_ADMIN_PASSWORD: z.string(),
  JWT_PRIVATE_KEY: z.string(),
  JWT_PUBLIC_KEY: z.string(),
})

export type Env = z.infer<typeof envSchema>
