import express from 'express'
import router from './router.js'
import { z } from 'zod'

const app = express()
const { CALENDAR_PORT: port } = z.object({
  CALENDAR_PORT: z.string().transform(str => parseInt(str))
    .pipe(z.number().int().min(0).max(65535))
    .default('3000')
}).parse(process.env)

app.disable('x-powered-by')

app.use(router)

app.listen(port, () => console.log(`[%s] Server listening at http://127.0.0.1:${port}`, (new Date()).toUTCString()))
