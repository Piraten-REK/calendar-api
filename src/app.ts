import express from 'express'
import DataHandler from './DataHandler.js'
import env from './env.js'

const app = express()

app.disable('x-powered-by')

app.use('/', (req, res) => {
  res.end('Hello world')
})

const dataHandler = new DataHandler()

void dataHandler.fetch().finally(() => {
  console.log(
    dataHandler.getDay(2024, 11, 7).toJson(),
    'done'
  )
})

// app.listen(env.PORT, () => {
//   console.log(`Server listening at http://[::1]:${env.PORT}`)
// })
