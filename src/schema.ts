import { z } from 'zod'
// @ts-expect-error
import ICAL from 'ical.js'
import { MonthInt } from './types'

const uid = z.string().uuid()

const year = z.string()
  .transform(str => parseInt(str))
  .pipe(
    z.number().int().min(1970).max(2100)
  )

const month = z.string()
  .transform(str => parseInt(str))
  .pipe(
    z.number().int().min(1).max(12)
  )
  .transform(it => it as MonthInt)

// --- v1 ------

export const v1Month = z.object({
  year,
  month
})

export const v1Day = z.object({
  year,
  month,
  day: z.string()
    .transform(str => parseInt(str))
    .pipe(
      z.number().int().min(1)
    )
}).refine(({ year, month, day }) =>
  day <= ICAL.Time.daysInMonth(month, year)
)

// --- v2 ------

export const v2Id = z.object({
  id: uid
})

export const v2IdYear = z.object({
  year,
  id: uid
})

export const v2IdMonth = z.object({
  year,
  month,
  id: uid
})

export const v2IdDay = z.object({
  year,
  month,
  day: z.string()
    .transform(str => parseInt(str))
    .pipe(
      z.number().int().min(1)
    ),
  id: uid
}).refine(({ year, month, day }) =>
  day <= ICAL.Time.daysInMonth(month, year)
)
