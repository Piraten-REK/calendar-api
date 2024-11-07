import express from 'express'
import env from './env'

const app = express()

app.disable('x-powered-by')

app.use('/', (req, res) => {
  res.end('Hello world')
})

app.listen(env.PORT, () => {
  console.log(`Server listening at http://[::1]:${env.PORT}`)
})
