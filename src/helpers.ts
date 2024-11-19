import { Response } from 'express'
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

export function sendZodError (res: Response, error: ZodError): void {
  const [detail] = Object.values(error.flatten())
    .flat()
    .filter(it => it != null && typeof it === 'string')

  sendProblem(res, {
    status: 400,
    title: error.message,
    detail
  })
}
