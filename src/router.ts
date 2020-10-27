import express from 'express'
import signet from './signet'
import { Time } from 'ical.js'
import dataHandler from './dataHandler'

const router = express.Router()

const text: [string, string] = ['Content-Type', 'text/plain']
const json: [string, string] = ['Content-Type', 'application/json; charset=utf-8']

router.use((req, res, next) => {
  res.set('Allow', 'GET, HEAD')
  next()
})

router.get('/', (req, res) => res.status(200).set(...text).send(signet))

router.get('/:year/:month', (req, res) => {
  const [ year, month ] = [
    req.params.year,
    req.params.month
  ].map(it => parseInt(it))
  
  if ([ year, month ].some(it => isNaN(it))) res.status(400).set(...text).send('Invalid data in URI')
  else if (year < 1970 || year > 2100) res.status(400).set(...text).send('`year` must be between 1970 and 2100')
  else if (month < 1 || month > 12) res.status(400).set(...text).send('`month` must be between 1 and 12')
  else res.status(200).set(...json).set('Last-Modified', dataHandler.lastModified.toUTCString()).json(dataHandler.getMonth(year, month))
})

router.get('/:year/:month/:day', (req, res) => {
  const [ year, month, day ] = [
    req.params.year,
    req.params.month,
    req.params.day
  ].map(it => parseInt(it))
  
  if ([ year, month ].some(it => isNaN(it))) res.status(400).set(...text).send('Invalid data in URI')
  else if (year < 1970 || year > 2100) res.status(400).set(...text).send('`year` must be between 1970 and 2100')
  else if (month < 1 || month > 12) res.status(400).set(...text).send('`month` must be between 1 and 12')
  else if (day < 1 || day > Time.daysInMonth(month, year)) res.status(400).set(...text).send('`day` must be between 1 and ' + Time.daysInMonth(month, year).toString())
  else res.status(200).set(...json).set('Last-Modified', dataHandler.lastModified.toUTCString()).json(dataHandler.getDay(year, month, day))
})

router.use((req, res) => {
  if (req.method.toUpperCase() === 'HEAD') res.status(404).set(...text).end()
  else if (req.method.toUpperCase() === 'GET') res.status(404).set(...text).end('Not Found')
  else res.status(405).set(...text).end('Method Not Allowed')
})

export default router