import ICAL from 'ical.js'
import Event, { RecurringEvent } from './Event.js'
import Month from './Month.js'

/** Data source for iCAL data */
const dataSource = process.env.ICS_URL as string | null ??
  'https://cloud.piraten-rek.de/remote.php/dav/public-calendars/CRowRieFfHH8cqDy?export'

/**
 * Uses node:fetch to perform a GET request
 * @param url URI of the request
 * @param headers HTTP headers, default `{}`
 * @returns Promise of data as a string
 */
export const getRequest = async (url: string, init?: RequestInit): Promise<string> =>
  await fetch(url, init)
    .then(async res => await res.text())

interface ExtractedEvents {
  events: ICAL.Event[]
  timezone: ICAL.Timezone
}
/**
 * Extracts ICAL.Events from raw iCAL data
 * @param input raw string of iCal data
 * @returns Array of ICAL.Events and Timezone
 */
export async function extractEvents (input: string): Promise<ExtractedEvents> {
  return await new Promise<ExtractedEvents>((resolve, reject) => {
    try {
      const data = ICAL.parse(input)
      const comp = new ICAL.Component(data)
      const result = comp.getAllSubcomponents('vevent')
        .map(event => new ICAL.Event(event))

      resolve({
        events: result,
        timezone: new ICAL.Timezone(comp.getFirstSubcomponent('vtimezone') as ICAL.Component)
      })
    } catch (error) {
      reject(error)
    }
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
  } else if (bDate.isDate && !aDate.isDate) {
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

interface ConvertEventsReturn {
  singleEvents: Event[]
  recurringEvents: RecurringEvent[]
  timezone: ICAL.Timezone
}

/**
 * Converts an ICAL.Event to an Events
 * @param icalEvents Event to be converted
 * @param timezone Timezone to test for
 */
async function convertEvents (icalEvents: ICAL.Event[], timezone: ICAL.Timezone): Promise<ConvertEventsReturn> {
  return await new Promise<ConvertEventsReturn>(resolve => {
    const singleEvents: Event[] = []
    const recurringEvents: RecurringEvent[] = []

    for (let idx = 0, event = icalEvents[0]; idx < icalEvents.length; event = icalEvents[++idx]) {
      if (!event.isRecurring()) {
        // Single Event
        singleEvents.push(new Event(
          event.summary,
          event.description,
          event.location,
          event.startDate,
          event.endDate
        ))
      } else {
        recurringEvents.push(((month: Month) => {
          const events: Event[] = []
          const iterator = event.iterator(month.firstVisible)

          let val: ICAL.Time
          // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
          while ((val = iterator.next()) && month.lastVisible.compareDateOnlyTz(val, month.timezone) >= 0) {
            if (val.compareDateOnlyTz(event.startDate, month.timezone) === -1) {
              continue
            }

            const ev = new Event(
              event.summary,
              event.description,
              event.location,
              event.startDate.clone(),
              event.endDate.clone()
            )

            const diff = subtractDates(val, event.startDate)
            ev.start.addDuration(diff)
            ev.end.addDuration(diff)
            events.push(ev)
          }

          return events
        }) satisfies RecurringEvent)
      }
    }

    resolve({
      singleEvents,
      recurringEvents,
      timezone
    })
  })
}

/**
 * Retrieves new data from the data source
 * @returns Events and Timezone
 */
export default async function getNewData (): Promise<ConvertEventsReturn> {
  return await getRequest(dataSource)
    .then(async res => await extractEvents(res))
    .then(async ({ events, timezone }) => await convertEvents(events, timezone))
}
