import ICAL from 'ical.js';
import Event from './Event.js';
/** Data source for iCAL data */
const dataSource = process.env.ICS_URL ??
    'https://cloud.piraten-rek.de/remote.php/dav/public-calendars/CRowRieFfHH8cqDy?export';
/**
 * Uses node:fetch to perform a GET request
 * @param url URI of the request
 * @param headers HTTP headers, default `{}`
 * @returns Promise of data as a string
 */
export const getRequest = async (url, init) => await fetch(url, init)
    .then(async (res) => await res.text());
/**
 * Extracts ICAL.Events from raw iCAL data
 * @param input raw string of iCal data
 * @returns Array of ICAL.Events and Timezone
 */
export async function extractEvents(input) {
    return await new Promise((resolve, reject) => {
        try {
            const data = ICAL.parse(input);
            const comp = new ICAL.Component(data);
            const result = comp.getAllSubcomponents('vevent')
                .map(event => new ICAL.Event(event));
            resolve({
                events: result,
                timezone: new ICAL.Timezone(comp.getFirstSubcomponent('vtimezone'))
            });
        }
        catch (error) {
            reject(error);
        }
    });
}
/** Substracts bDate from aDate */
export function subtractDates(aDate, bDate) {
    if (aDate.isDate && !bDate.isDate) {
        aDate = new ICAL.Time({
            year: aDate.year,
            month: aDate.month,
            day: aDate.day,
            hour: bDate.hour,
            minute: bDate.minute,
            second: bDate.second,
            isDate: false
        }, aDate.zone);
    }
    else if (bDate.isDate && !aDate.isDate) {
        bDate = new ICAL.Time({
            year: bDate.year,
            month: bDate.month,
            day: bDate.day,
            hour: aDate.hour,
            minute: aDate.minute,
            second: aDate.second,
            isDate: false
        }, bDate.zone);
    }
    return aDate.subtractDate(bDate);
}
/**
 * Converts an ICAL.Event to an Events
 * @param icalEvents Event to be converted
 * @param timezone Timezone to test for
 */
async function convertEvents(icalEvents, timezone) {
    return await new Promise(resolve => {
        const singleEvents = [];
        const recurringEvents = [];
        for (let idx = 0, event = icalEvents[0]; idx < icalEvents.length; event = icalEvents[++idx]) {
            if (!event.isRecurring()) {
                // Single Event
                singleEvents.push(new Event(event.summary, event.description, event.location, event.startDate, event.endDate));
            }
            else {
                recurringEvents.push(((month) => {
                    const events = [];
                    const iterator = event.iterator(month.firstVisible);
                    let val;
                    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
                    while ((val = iterator.next()) && month.lastVisible.compareDateOnlyTz(val, month.timezone) >= 0) {
                        if (val.compareDateOnlyTz(event.startDate, month.timezone) === -1) {
                            continue;
                        }
                        const ev = new Event(event.summary, event.description, event.location, event.startDate.clone(), event.endDate.clone());
                        const diff = subtractDates(val, event.startDate);
                        ev.start.addDuration(diff);
                        ev.end.addDuration(diff);
                        events.push(ev);
                    }
                    return events;
                }));
            }
        }
        resolve({
            singleEvents,
            recurringEvents,
            timezone
        });
    });
}
/**
 * Retrieves new data from the data source
 * @returns Events and Timezone
 */
export default async function getNewData() {
    return await getRequest(dataSource)
        .then(async (res) => await extractEvents(res))
        .then(async ({ events, timezone }) => await convertEvents(events, timezone));
}
