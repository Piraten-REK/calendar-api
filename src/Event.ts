import { Time } from 'ical.js'
import Month from './Month'

export class Event {
  public readonly title: string
  public readonly description: string
  public readonly location: string
  public readonly start: Time
  public readonly end: Time
  get dayLong(): boolean {
    return this.start.icaltype === 'date' && this.end.icaltype === 'date'
  }

  constructor(title: string, description: string, location: string, start: Time, end: Time) {
    this.title = title
    this.description = description
    this.location = location
    this.start = start
    this.end = end
    if (this.end.isDate) this.end.adjust(-1, 0, 0, 0, 0)
  }

  toJSON(): Object {
    return {
      title: this.title,
      description: this.description,
      location: this.location,
      start: this.start.toString(),
      end: this.end.toString()
    }
  }
}

export type RecurrentEvent = (month: Month) => Event[]

export type AnyEvent = Event|RecurrentEvent