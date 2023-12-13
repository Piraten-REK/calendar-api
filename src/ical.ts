import * as ICAL from 'ical.js'
import { get } from 'https'
import { Event, RecurringEvent } from './Event'

/** Data source for iCAL data */
const dataSource = 'https://cloud.piraten-rek.de/remote.php/dav/public-calendars/CRowRieFfHH8cqDy?export'

/**
 * Uses https.get to perform a GET request
 * @param url URI of the request
 * @param headers HTTP headers, default `{}`
 * @returns Promise of data as a string
 */
export async function getRequest (url: string, headers: Record<string, string> = {}): Promise<string> {
  return await new Promise<string>((resolve, reject) => {
    get(url, { headers }, res => {
      let data = ''
      res.on('data', (chunk: string) => {
        data += chunk
      })
      res.on('end', () => resolve(data))
    }).on('error', err => reject(err))
  })
}

export interface FetchedEvents {
  events: ICAL.Event[]
  timezone: ICAL.Timezone
}

/**
 * Extracts ICAL.Events from raw iCAL data
 * @param input raw string of iCal data
 * @returns Array of ICAL.Events and Timezone
 */
export async function extractEvents (input: string): Promise<FetchedEvents> {
  return await new Promise((resolve, reject) => {
    try {
      const data = ICAL.parse(input)
      const component = new ICAL.Component(data)
      const events = component.getAllSubcomponents('vevent').map(event => new ICAL.Event(event))
      resolve({
        events,
        timezone: new ICAL.Timezone(component.getFirstSubcomponent('vtimezone') as ICAL.Component)
      } satisfies FetchedEvents)
    } catch (error) {
      reject(error)
    }
  })
}

export interface ConvertedEvents {
  singleEvents: Event[]
  recurringEvents: RecurringEvent[]
  timezone: ICAL.Timezone
}

/**
 * Converts an array of ICAL.Event to Events
 * @param events Event to be converted
 * @param timezone Timezone to test for
 */
export async function convertEvents (events: ICAL.Event[], timezone: ICAL.Timezone): Promise<ConvertedEvents> {
  return await new Promise(resolve => {
    const singleEvents: Event[] = []
    const recurringEvents: RecurringEvent[] = []

    for (let idx = 0, event = events[0]; idx < events.length; event = events[++idx]) {
      if (!event.isRecurring()) {
        singleEvents.push(new Event(
          event.summary,
          event.description,
          event.location,
          event.startDate,
          event.endDate
        ))
      } else {
        const recurringEvent: RecurringEvent = (month) => {
          const events: Event[] = []
          const iterator = event.iterator(month.firstVisible)

          let date = iterator.next()
          while (date != null && month.lastVisible.compareDateOnlyTz(date, month.timezone) >= 0) {
            if (date.compareDateOnlyTz(event.startDate, month.timezone) === -1) {
              date = iterator.next()
              continue
            }

            const newEvent = new Event(
              event.summary,
              event.description,
              event.location,
              event.startDate.clone(),
              event.endDate.clone()
            )
            const diff = subtractDates(date, event.startDate)
            newEvent.start.addDuration(diff)
            newEvent.end.addDuration(diff)

            events.push(newEvent)
          }

          return events
        }

        recurringEvents.push(recurringEvent)
      }
    }

    resolve({
      singleEvents,
      recurringEvents,
      timezone
    })
  })
}

/** Substracts bDate from aDate */
export function subtractDates (aDate: ICAL.Time, bDate: ICAL.Time): ICAL.Duration {
  if (aDate.isDate && !bDate.isDate) {
    aDate = new ICAL.Time({
      year: aDate.year,
      month: aDate.month,
      day: aDate.day,
      hour: bDate.hour,
      minute: bDate.minute,
      second: bDate.second,
      isDate: false
    }, aDate.zone)
  } else if (!aDate.isDate && bDate.isDate) {
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

/**
 * Retrieves new data from the data source
 * @returns Events and Timezone
 */
export default async function getNewData (): Promise<ConvertedEvents> {
  return await getRequest(dataSource)
    .then(async icalResponse => await extractEvents(icalResponse))
    .then(async ({ events, timezone }) => await convertEvents(events, timezone))
}
