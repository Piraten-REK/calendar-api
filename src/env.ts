import { z } from 'zod'
import dotenv from 'dotenv'

dotenv.config()

export const envSchema = z.object({
  PORT: z.string()
    .transform(port => Number.parseInt(port)).pipe(
      z.number().int().min(0).max(65535)
    )
}).passthrough()

export default envSchema.parse(process.env)
