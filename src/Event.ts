// @ts-expect-error
import ICAL from 'ical.js'
import type { ReturnedByApi } from './types'

interface EventJsonable {
  readonly id: string
  readonly title: string
  readonly description: string
  readonly location: string
  readonly start: string
  readonly end: string
  readonly allDay: boolean
}

export default class Event implements ReturnedByApi<EventJsonable> {
  readonly id: string
  readonly title: string
  readonly description: string
  readonly location: string
  readonly start: ICAL.Time
  readonly end: ICAL.Time

  get allDay (): boolean {
    return this.start.icaltype === 'date' && this.end.icaltype === 'date'
  }

  constructor (event: ICAL.Event) {
    this.id = event.uid
    this.title = event.summary
    this.description = event.description
    this.location = event.location
    this.start = event.startDate.clone()
    this.end = event.endDate.clone()
  }

  static createWithDiff (icalEvent: ICAL.Event, relativeTo: ICAL.Time): Event {
    const event = new Event(icalEvent)

    let a = relativeTo.clone()
    let b = icalEvent.startDate

    if (a.isDate && !b.isDate) {
      a = new ICAL.Time({
        year: a.year,
        month: a.month,
        day: a.day,
        hour: b.hour,
        minute: b.minute,
        second: b.second,
        isDate: false
      }, b.zone)
    } else if (b.isDate && !a.isDate) {
      b = new ICAL.Time({
        year: b.year,
        month: b.month,
        day: b.day,
        hour: a.hour,
        minute: a.minute,
        second: a.second,
        isDate: false
      }, a.zone)
    }

    const diff = a.subtractDate(b)
    event.start.addDuration(diff)
    event.end.addDuration(diff)

    return event
  }

  toPlainObject (): EventJsonable {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      location: this.description,
      start: this.start.toString(),
      end: this.start.toString(),
      allDay: this.allDay
    }
  }

  toJson (space?: string | number): string {
    return JSON.stringify(this.toPlainObject(), null, space)
  }
}
