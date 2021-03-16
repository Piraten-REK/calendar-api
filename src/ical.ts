import * as ICAL from 'ical.js'
import { get } from 'https'
import { RecurrentEvent, Event } from './Event'
import Month from './Month'

/** Data source for iCAL data */
const dataSource = 'https://cloud.piraten-rek.de/remote.php/dav/public-calendars/CRowRieFfHH8cqDy?export'

/**
 * Uses https.get to perform a GET request
 * @param url URI of the request
 * @param headers HTTP headers, default `{}`
 * @returns Promise of data as a string
 */
export function getRequest (url: string, headers: {} = {}): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    get(url, { headers: headers }, res => {
      let data = ''
      res.on('data', chunk => { data += chunk })
      res.on('end', () => resolve(data) )
    }).on('error', err => reject(err))
  })
}

/**
 * Extracts ICAL.Events from raw iCAL data
 * @param input raw string of iCal data
 * @returns Array of ICAL.Events and Timezone
 */
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

/**
 * Retrieves new data from the data source
 * @returns Events and Timezone
 */
export default function getNewData (): Promise<{ singleEvents: Event[]; recurrentEvents: RecurrentEvent[]; timezone: ICAL.Timezone; }> {
  return getRequest(dataSource)                                             // Get raw data from data source
    .then(r => extractEvents(r))                                            // Extract raw data into ICAL.Events
    .then(({ events, timezone }) => convertEvents(events, timezone))        // Converts an ICAL.Event to an Events
}

/**
 * Converts an ICAL.Event to an Events
 * @param events Event to be converted
 * @param timezone Timezone to test for
 */
function convertEvents (events: ICAL.Event[], timezone: ICAL.Timezone): Promise<{ singleEvents: Event[], recurrentEvents: RecurrentEvent[], timezone: ICAL.Timezone }> {
  return new Promise(resolve => {
    const singleEvents: Event[] = []
    const recurrentEvents: RecurrentEvent[] = []

    for (const event of events) {
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
        const e: RecurrentEvent = (month: Month): Event[] => {
          const r: Event[] = []
          const iterator = event.iterator(month.firstVisible)
  
          let val: ICAL.Time
          while ((val = iterator.next()) && month.lastVisible.compareDateOnlyTz(val, month.timezone) >= 0) {
            if (val.compareDateOnlyTz(event.startDate, month.timezone) === -1) continue
  
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
        }
        recurrentEvents.push(e)
      }
    }

    resolve({
      singleEvents: singleEvents,
      recurrentEvents: recurrentEvents,
      timezone: timezone
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
