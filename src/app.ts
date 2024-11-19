import express from 'express'
import DataHandler from './DataHandler.js'
import { v1Day, v1Month } from './schema.js'
import env from './env.js'
import { sendZodError } from './helpers.js'

const rfc2822 = new Intl.DateTimeFormat('en', {
  weekday: 'short',
  year: 'numeric',
  month: 'short',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  timeZoneName: 'short'
})
const toRfc2822 = (date: Date): string => {
  const parts = Object.fromEntries(rfc2822.formatToParts(date)
    .filter(it => it.type !== 'literal')
    .map(it => [it.type, it.value])
  ) as Record<'weekday' | 'day' | 'month' | 'year' | 'hour' | 'minute' | 'second' | 'timeZoneName', string>

  return `${parts.weekday}, ${parts.day} ${parts.month} ${parts.year} ${parts.hour}:${parts.minute}:${parts.second} ${parts.timeZoneName}`
}

const app = express()
const dataHandler = new DataHandler()

app.disable('x-powered-by')

app.use((req, res, next) => {
  res.setHeader('X-API-Version', 2)
  next()
})

app.get('/', (req, res) => {
  res
    .status(200)
    .setHeader('Location', 'https://http.cat/204')
    .setHeader('Content-Type', 'text/plain; charset=utf-8')
    .send('"It\'s more fun to be a pirate than to join the navy."\n\t– Steve Jobs\n')
    .end()
})

app.get('/:year/:month', (req, res) => {
  const params = v1Month.safeParse(req.params)

  if (!params.success) {
    return sendZodError(res, params.error)
  }

  res.header('Last-Modified', toRfc2822(dataHandler.lastUpdate))

  if (req.headers['if-modified-since'] != null && new Date(req.headers['if-modified-since']) < dataHandler.lastUpdate) {
    res
      .status(304)
      .header('Content-Type', 'text/plain; charset=utf-8')
      .end()
    return
  }

  res.header('Content-Type', 'application/json; charset=utf-8').json(
    dataHandler.getMonth(params.data.year, params.data.month).toPlainObject()
  ).end()
})

app.get('/:year/:month/:day', (req, res) => {
  const params = v1Day.safeParse(req.params)

  if (!params.success) {
    return sendZodError(res, params.error)
  }

  if (req.headers['if-modified-since'] != null && new Date(req.headers['if-modified-since']) < dataHandler.lastUpdate) {
    res
      .status(304)
      .header('Last-Modified', toRfc2822(dataHandler.lastUpdate))
      .header('Content-Type', 'text/plain; charset=utf-8')
      .end()
    return
  }

  res.header('Content-Type', 'application/json; charset=utf-8').json(
    dataHandler.getDay(params.data.year, params.data.month, params.data.day)
  )
})

app.get('/id/:id', (req, res) => {
  res.status(501).end()
})

app.get('/id/:year/:id', (req, res) => {
  res.status(501).end()
})

app.get('/id/:year/:month/:id', (req, res) => {
  res.status(501).end()
})

app.get('/id/:year/:month/:day/:id', (req, res) => {
  res.status(501).end()
})

app.listen(env.PORT, () => {
  console.log(`Server listening at http://[::1]:${env.PORT}`)
})
