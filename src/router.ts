import express from 'express'
import ICAL from 'ical.js'
import dataHandler from './dataHandler.js'
import { z } from 'zod'
import fs from 'fs'
import path from 'path'

const yearMonthSchema = z.object({
  year: z.string()
    .transform(str => parseInt(str))
    .pipe(
      z.number()
        .int('year must be an integer')
        .min(2010, 'year must be between 2010 and 2100 (inclusive)')
        .max(2100, 'year must be between 2010 and 2100 (inclusive)')
    ),
  month: z.string()
    .transform(str => parseInt(str))
    .pipe(
      z.number()
        .int('month must be an integer')
        .min(1, 'month must be between 1 and 12 (inclusive)')
        .max(12, 'month must be between 1 and 12 (inclusive)')
    )
})
const yearMonthDaySchema = yearMonthSchema.extend({
  day: z.string()
    .transform(str => parseInt(str))
    .pipe(
      z.number()
        .int('int must be an integer')
        .min(1, 'day must be at least 1')
    )
}).refine(
  ({ year, month, day }) => day <= ICAL.Time.daysInMonth(month, year),
  {
    message: 'day cannot be greater than there are days in the given month'
  }
)

const signet = fs.readFileSync(
  path.resolve('public/logo.txt')
).toString()

const favicon = fs.readFileSync(
  path.resolve('public/favicon.ico')
)

const router: express.Router = express.Router()

const contentTypes = {
  text: ['Content-Type', 'text/plain'],
  json: ['Content-Type', 'application/json; charset=utf-8'],
  problem: ['Content-Type', 'application/problem+json; charset=utf-8'],
  icon: ['Content-Type', 'image/x-icon']
} as const

router.use((req, res, next) => {
  res.set('Allow', 'GET, HEAD, OPTIONS')
  res.set('X-Calender-API', '2')
  switch (req.header('Origin')) {
    case 'https://piraten-rek.de':
      res.set('Access-Control-Allow-Origin', 'https://piraten-rek.de')
        .set('Vary', 'Origin')
      break
    case 'https://piratenpartei-rhein-erft.de':
      res.set('Access-Control-Allow-Origin', 'https://piratenpartei-rhein-erft.de')
        .set('Vary', 'Origin')
      break
    default:
      res.set('Access-Control-Allow-Origin', '*')
        .set('Vary', 'Origin')
  }
  next()
})

router.get('/', (_, res) => res.status(200).set(...contentTypes.text).send(signet))

router.get('/favicon.ico', (_, res) => res.status(200).set(...contentTypes.icon).send(favicon))

router.get('/:year/:month', (req, res) => {
  const parsed = yearMonthSchema.safeParse(req.params)

  if (!parsed.success) {
    const errors = parsed.error.flatten()
    return res.status(400)
      .header(...contentTypes.problem)
      .header('Content-Language', 'en')
      .json({
        type: 'https://calendar.piraten-rek.de/err/validation',
        title: 'Your request parameters didn\'t validate',
        'invalid-params': errors.fieldErrors
      })
  }

  const { year, month } = parsed.data

  res.status(200)
    .header(...contentTypes.json)
    .set('Last-Modified', dataHandler.lastModified.toUTCString())
    .json(dataHandler.getMonth(year, month))
})

router.get('/:year/:month/:day', (req, res) => {
  const parsed = yearMonthDaySchema.safeParse(req.params)

  if (!parsed.success) {
    const errors = parsed.error.flatten()
    return res.status(400)
      .header(...contentTypes.problem)
      .header('Content-Language', 'en')
      .json({
        type: 'https://calendar.piraten-rek.de/err/validation',
        title: 'Your request parameters didn\'t validate',
        'invalid-params': errors.fieldErrors
      })
  }

  const { year, month, day } = parsed.data

  res.status(200)
    .header(...contentTypes.json)
    .set('Last-Modified', dataHandler.lastModified.toUTCString())
    .json(dataHandler.getDay(year, month, day))
})

router.use((req, res) => {
  if (req.method.toUpperCase() === 'HEAD' || req.method.toUpperCase() === 'OPTIONS') {
    return res.status(404).set(...contentTypes.problem).end()
  }
  if (req.method.toUpperCase() === 'GET') {
    return res.status(404).set(...contentTypes.problem).json({
      type: 'https://calendar.piraten-rek.de/err/not-found',
      title: 'Not found',
      detail: `There is nothing to be found at "${req.path}"`
    })
  }
  res.status(405).set(...contentTypes.problem).json({
    type: 'https://calendar.piraten-rek.de/err/method-not-allowed',
    title: 'Method Not Allowed',
    detail: 'The only allowed methods are GET, HEAD and OPTIONS'
  })
})

export default router
