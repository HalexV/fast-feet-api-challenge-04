import { z } from 'zod'

export const envSchema = z.object({
  APP_PORT: z.coerce.number().default(3333),
  POSTGRES_HOST: z.string(),
  POSTGRES_PORT: z.coerce.number().default(5432),
  POSTGRES_USER: z.string(),
  POSTGRES_PASSWORD: z.string(),
  POSTGRES_DB: z.string(),
})

export type Env = z.infer<typeof envSchema>
