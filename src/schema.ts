import { z } from 'zod'
// @ts-expect-error
import ICAL from 'ical.js'
import { MonthInt } from './types'
import { weeksInYear } from './helpers'

const monthFormatter = new Intl.DateTimeFormat('en', { month: 'long' })
export const getMonthName = (month: MonthInt): string => monthFormatter.format(new Date(`2024-${month}-01`))

const year = z.string()
  .regex(/^\d+$/, 'The year must be a valid integer')
  .transform(str => parseInt(str))
  .pipe(
    z.number()
      .int('The year must be a valid integer')
      .min(1970, 'The minimum year is 1970')
      .max(2100, 'The maximum year is 2100')
  )

const month = z.string()
  .regex(/^\d+$/, 'The month must be a valid integer')
  .transform(str => parseInt(str))
  .pipe(
    z.number()
      .int('The month must be a valid integer')
      .min(1, 'The minimum month is 1 (= January)')
      .max(12, 'The maximum month is 12 (= December)')
  )
  .transform(it => it as MonthInt)

export const schema2Params = z.union([
  z.object({
    param0: year,
    param1: month
  })
    .transform(({ param0, param1 }) => ({
      year: param0,
      month: param1
    })),
  z.object({
    param0: year,
    param1: z.string()
      .regex(/^w\d{1,2}$/)
      .transform(w => parseInt(w.slice(1)))
      .pipe(
        z.number()
          .int('Week must be a valid integer')
          .min(1, 'The minimum week is 1')
      )
  })
    .refine(
      ({ param0, param1 }) => param1 <= weeksInYear(param0),
      ({ param0 }) => ({ message: `The maximum week of yeara ${param0} is ${weeksInYear(param0)}` })
    )
    .transform(({ param0, param1 }) => ({
      year: param0,
      week: param1
    }))
])

export const schema3Params = z.union([
  z.object({
    param0: year,
    param1: month,
    param2: z.string().uuid('The id of an event must be a valid UUIDv4')
  })
    .transform(({ param0, param1, param2 }) => ({
      year: param0,
      month: param1,
      id: param2
    })),
  z.object({
    param0: year,
    param1: month,
    param2: z.string()
      .regex(/^\d+$/, 'The day must be a valid integer')
      .transform(str => parseInt(str))
      .pipe(
        z.number()
          .int('The day must be a valid integer')
          .min(1, 'The minimum day is 1')
      )
  })
    .refine(
      ({ param0, param1, param2 }) => param2 <= ICAL.Time.daysInMonth(param1, param0),
      ({ param0, param1 }) => ({ message: `The maximum day in ${getMonthName(param1)} of ${param0} is ${ICAL.Time.daysInMonth(param1, param0)}` })
    )
    .transform(({ param0, param1, param2 }) => ({
      year: param0,
      month: param1,
      day: param2
    }))
])

export const schema4Params = z.object({
  param0: year,
  param1: month,
  param2: z.string()
    .regex(/^\d+$/, 'The day must be a valid integer')
    .transform(str => parseInt(str))
    .pipe(
      z.number()
        .int('The day must be a valid integer')
        .min(1, 'The minimum day is 1')
    ),
  param3: z.string().uuid('The id of an event must be a valid UUIDv4')
})
  .refine(
    ({ param0, param1, param2 }) => param2 <= ICAL.Time.daysInMonth(param1, param0),
    ({ param0, param1 }) => ({ message: `The maximum day in ${getMonthName(param1)} of ${param0} is ${ICAL.Time.daysInMonth(param1, param0)}` })
  )
  .transform(({ param0, param1, param2, param3 }) => ({
    year: param0,
    month: param1,
    day: param2,
    id: param3
  }))
