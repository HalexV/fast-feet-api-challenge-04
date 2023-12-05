import { z } from 'zod'

export const envSchema = z.object({
  APP_PORT: z.coerce.number().default(3333),
  POSTGRES_URL: z.string(),
})

export type Env = z.infer<typeof envSchema>
