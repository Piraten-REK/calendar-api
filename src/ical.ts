import * as ICAL from 'ical.js'
import { get } from 'https'
import { RecurrentEvent, Event, AnyEvent } from './Event'
import Month from './Month'

export function getRequest (url: string, headers: {} = {}): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    get(url, { headers: headers }, res => {
      let data = ''
      res.on('data', chunk => { data += chunk })
      res.on('end', () => resolve(data) )
    }).on('error', err => reject(err))
  })
}

export function extractEvents (input: string): Promise<{events: ICAL.Event[]; timezone: ICAL.Timezone;}> {
  return new Promise((resolve, reject) => {
    try {
      const data = ICAL.parse(input)
      const comp = new ICAL.Component(data)
      const result = comp.getAllSubcomponents('vevent').map(event => new ICAL.Event(event))
      resolve({
        events: result,
        timezone: new ICAL.Timezone(comp.getFirstSubcomponent('vtimezone') as ICAL.Component)
      })
    } catch (e) {
      reject(e)
    }
  })
}

export default function getNewData (): Promise<{ events: AnyEvent[]; timezone: ICAL.Timezone; }> {
  return getRequest('https://cloud.piraten-rek.de/remote.php/dav/public-calendars/CRowRieFfHH8cqDy?export')
  .then(r => extractEvents(r))
  .then(data => {
    const { events, timezone } = data
    return new Promise<{ events: AnyEvent[]; timezone: ICAL.Timezone; }>(resolve => {
      const convertEvents = (event: ICAL.Event): AnyEvent => {
        if (!event.isRecurring()) {
          return new Event(
            event.summary,
            event.description,
            event.location,
            event.startDate,
            event.endDate
          )
        } else {
          return function(month: Month): Event[] {
            const r: Event[] = []
            const iterator = event.iterator(month.firstVisible)

            let val: ICAL.Time
            while ((val = iterator.next()) && month.lastVisible.compareDateOnlyTz(val, timezone) >= 0) {
              if (val.compareDateOnlyTz(event.startDate, timezone) === -1) continue

              const e = new Event(
                event.summary,
                event.description,
                event.location,
                event.startDate.clone(),
                event.endDate.clone()
              )
              const diff = subtractDates(val, event.startDate)
              e.start.addDuration(diff)
              e.end.addDuration(diff)
              r.push(e)
            }

            return r
          } as RecurrentEvent
        }
      }

      resolve({ events: events.map(e => convertEvents(e)), timezone: timezone })
    })
  })
}

/** Substracts bDate from aDate */
export function subtractDates(aDate: ICAL.Time, bDate: ICAL.Time): ICAL.Duration {
  const [ a, b ] = [ aDate.isDate, bDate.isDate ]

  if (a && !b) {
    aDate = new ICAL.Time({
      year: aDate.year,
      month: aDate.month,
      day: aDate.day,
      hour: bDate.hour,
      minute: bDate.minute,
      second: bDate.second,
      isDate: false
    }, aDate.zone)
  } else if (b && !a) {
    bDate = new ICAL.Time({
      year: bDate.year,
      month: bDate.month,
      day: bDate.day,
      hour: aDate.hour,
      minute: aDate.minute,
      second: aDate.second,
      isDate: false
    }, bDate.zone)
  }
  return aDate.subtractDate(bDate)
}
