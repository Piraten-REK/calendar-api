import express from 'express'
import DataHandler from './DataHandler.js'
import { getMonthName, schema2Params, schema3Params, schema4Params } from './schema.js'
import env from './env.js'
import { formatOrdinals, sendProblem, sendZodError } from './helpers.js'

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

const lastModified = (req: express.Request, res: express.Response): boolean => {
  res.header('Last-Modified', toRfc2822(dataHandler.lastUpdate))

  if (req.headers['if-modified-since'] != null && new Date(req.headers['if-modified-since']) > dataHandler.lastUpdate) {
    res.status(304).end()
    return true
  }

  return false
}

const setContentType = (res: express.Response, subtype: string): express.Response =>
  res.header('Content-Type', `application/x.piraten-rek.de.calendar.${subtype}+json; charset=utf-8`)

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
    .setHeader('Content-Type', 'text/plain; charset=utf-8')
    .send('"It\'s more fun to be a pirate than to join the navy."\n\t– Steve Jobs\n')
    .end()
})

app.get('/:param0', (req, res) => sendProblem(res, {
  status: 400,
  title: 'You need to specify month or week of year',
  detail: 'You need to at least specify a month or a week of year to retrieve'
}))

app.get('/:param0/:param1', (req, res) => {
  const params = schema2Params.safeParse(req.params)

  if (!params.success) {
    return sendZodError(req, res, params.error)
  }

  if (lastModified(req, res)) return

  if ('month' in params.data) {
    setContentType(res, 'month').json(
      dataHandler.getMonth(params.data.year, params.data.month).toPlainObject()
    )
    return
  }

  setContentType(res, 'week-of-year').json(
    dataHandler.getWeek(params.data.year, params.data.week).toPlainObject()
  )
})

app.get('/:param0/:param1/:param2', (req, res) => {
  const params = schema3Params.safeParse(req.params)

  if (!params.success) {
    return sendZodError(req, res, params.error)
  }

  if (lastModified(req, res)) return

  if ('day' in params.data) {
    setContentType(res, 'day').json(
      dataHandler.getDay(params.data.year, params.data.month, params.data.day).toPlainObject()
    )
    return
  }

  const events = dataHandler.getMonth(params.data.year, params.data.month)
    .getId(params.data.id)

  if (events.empty) {
    return sendProblem(res, {
      status: 404,
      title: 'Specified event could not be found',
      detail: `The event with id "${params.data.id}" could not be found in ${getMonthName(params.data.month)} of ${params.data.year}.`,
      instance: `${req.host}${req.path}`
    })
  }

  setContentType(res, 'event').json(
    events.toPlainObject()
  )
})

app.get('/:param0/:param1/:param2/:param3', (req, res) => {
  const params = schema4Params.safeParse(req.params)

  if (!params.success) {
    return sendZodError(req, res, params.error)
  }

  if (lastModified(req, res)) return

  const { data } = params

  const events = dataHandler.getDay(data.year, data.month, data.day).getId(data.id)

  if (events.empty) {
    return sendProblem(res, {
      status: 404,
      title: 'Specified event could not be found',
      detail: `The event with id "${params.data.id}" could not be found in the ${formatOrdinals(params.data.day)} of ${getMonthName(params.data.month)}, ${params.data.year}.`,
      instance: `${req.host}${req.path}`
    })
  }

  setContentType(res, 'event').json(
    events.toPlainObject()
  )
})

app.listen(env.PORT, () => {
  console.log(`Server listening at http://[::1]:${env.PORT}`)
})
