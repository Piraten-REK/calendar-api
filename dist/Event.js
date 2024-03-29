/**
 * @class Event
 * Represents a single event
 *
 * @since 1.0.0
 */
export default class Event {
    /** Event title */
    title;
    /** Event description */
    description;
    /** Event location */
    location;
    /** Event start time */
    start;
    /** Event end time */
    end;
    constructor(title, description, location, start, end) {
        this.title = title;
        this.description = description;
        this.location = location;
        this.start = start;
        this.end = end;
        if (this.end.isDate) {
            this.end.adjust(-1, 0, 0, 0, 0);
        }
    }
    /** True if event is all day long */
    get dayLong() {
        return this.start.icaltype === 'date' &&
            this.end.icaltype === 'date';
    }
    toJSONObject() {
        return {
            title: this.title,
            description: this.description,
            location: this.location,
            start: this.start.toString(),
            end: this.end.toString()
        };
    }
    /**
     * Checks whether the Event affects a given date.
     * @param date Date to be checked for
     * @param timezone Timezone to be cheked in
     *
     * @since 2.0.0
     */
    affetcsDate(date, timezone) {
        return this.start.compareDateOnlyTz(date, timezone) <= 0 &&
            this.end.compareDateOnlyTz(date, timezone) >= 0;
    }
}
