import { Request, Response } from 'express'
import { ProblemObj } from './types'
import { ZodError } from 'zod'

export function mapGetOrSet <K, V> (map: Map<K, V>, key: K, setter: (() => V)): V {
  if (!map.has(key)) {
    const value = setter()

    map.set(key, value)
    return value
  }

  return map.get(key) as V
}

export function sendProblem (res: Response, problem: ProblemObj): void {
  res
    .status(problem.status)
    .setHeader('Content-Type', 'application/problem+json; charset=utf-8')
    .json(problem)
}

export function sendZodError (req: Request, res: Response, error: ZodError): void {
  const [detail] = Object.values(error.flatten().fieldErrors)
    .flat()
    .filter(it => it != null && typeof it === 'string')

  sendProblem(res, {
    status: 400,
    title: 'Invalid argument',
    detail,
    instance: `${req.host}${req.path}`
  })
}

export function getWeekNumber (date?: Date): [number, number] {
  const d = date != null ? new Date(date) : new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + 4 - (d.getDay() > 0 ? d.getDay() : 7))
  const yearStart = new Date(d.getFullYear(), 0, 1)
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86_400_000) + 1) / 7)

  return [weekNo, d.getFullYear()]
}

export function weeksInYear (year: number): 52 | 53 {
  const d = new Date(year, 11, 31)
  const [week] = getWeekNumber(d)
  return week === 1 ? 52 : 53
}

const enOrdinalRules = new Intl.PluralRules('en', { type: 'ordinal' })

const suffixes = new Map([
  ['one', 'st'],
  ['two', 'nd'],
  ['few', 'rd'],
  ['other', 'th']
])
export const formatOrdinals = (n: number): string => {
  const rule = enOrdinalRules.select(n)
  const suffix = suffixes.get(rule as any) ?? ''
  return `${n}${suffix}`
}
