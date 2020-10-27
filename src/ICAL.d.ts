declare module 'ical.js' {
  /** The number of characters before iCalendar line folding should occur
   * @static
   * @default 75
   */
  export declare let foldLength: number

  /** The character(s) to be used for a newline. The default value is provided by rfc5545.
   * @static
   * @default '\r\n'
   */
  export declare let newLineChar: string

  /** Parses iCalendar or vCard data into a raw jCal object. Consult documentation on the layers|layers of parsing for more details.
   * @param input The string data to parse
   * @returns A single jCal object, or an array thereof
   * @static
   */
  export declare function parse(input: string): Object|Object[]

  /** Convert a full jCal/jCard array into a iCalendar/vCard string.
   * @param jCal The jCal/jCard document
   * @returns The stringified iCalendar/vCard document
   * @static
   */
  export declare function stringify(jCal: Array): string

  /** @class Wraps a jCal component, adding convenience methods to add, remove and update subcomponents and properties. */
  export declare class Component {
    /** @constructs
     * @param jcal Raw jCal component data OR name of new component
     * @param parent Parent component to associate
     */
    constructor (jcal: Array|string, parent?: Component)

    /** The name of this component */
    readonly name: string

    /** Create an {@link Component} by parsing the passed iCalendar string.
     * @param str The iCalendar string to parse
     */
    static fromString (str: string): void

    /** Adds an {@link Property} to the component.
     * @param property The property to add
     * @returns The passed in property
    */
    addProperty (property: Property): Property

    /** Helper method to add a property with a value to the component.
     * @param name Property name to add
     * @param value Property value
     * @returns The created property
     */
    addPropertyWithValue (name: string, value: string|number|Object): Property

    /** Adds a single sub component.
     * @param component The component to add
     * @returns The passed in component
     */
    addSubComponent (component: Component): Component

    /** Get all properties in the component, optionally filtered by name.
     * @param name Lowercase property name
     * @returns List of properties
     */
    getAllProperties (name?: string): Array<Property>

    /** Finds all sub components, optionally filtering by name.
     * @param name Optional name to filter by
     * @returns The found sub components
     */
    getAllSubcomponents (name?: string): Array<Component>

    /** Finds the first property, optionally with the given name.
     * @param name Lowercase property name
     * @returns The found property
     */
    getFirstProperty (name?: string): Property?;

    /** Returns first property's value, if available.
     * @param name Lowercase property name
     * @returns The found property value.
     */
    getFirstPropertyValue (name?: string): string?;

    /** Finds first sub component, optionally filtered by name.
     * @param name Optional name to filter by
     * @returns The found subcomponent
     */
    getFirstSubcomponent (name?: string): Component?;

    /** Returns true when a named property exists.
     * @param name The property name
     * @returns True, when property is found
     */
    hasProperty (name: string): boolean

    /** Removes all properties associated with this component, optionally filtered by name.
     * @param name Lowercase property name
     * @returns True, when deleted
     */
    removeAllProperties (name?: string): boolean

    /** Removes all components or (if given) all components by a particular name.
     * @param name Lowercase component name
     */
    removeAllSubcomponents (name?: string)

    /** Removes a single property by name or the instance of the specific property.
     * @param nameOrProp Property name or instance to remove
     * @returns True, when deleted
     */
    removeProperty(nameOrProp: string|Property): boolean

    /** Removes a single component by name or the instance of a specific component.
     * @param nameOrComp Name of component, or component
     * @returns True when comp is removed
     */
    removeSubcomponent (nameOrComp: Component|string): boolean

    /** Returns the Object representation of this component. The returned object is a live jCal object and should be cloned if modified. */
    toJSON(): Object

    /** The string representation of this component. */
    toString(): string

    /** Helper method that will update or create a property of the given name and sets its value. If multiple properties with the given name exist, only the first is updated.
     * @param name Property name to update
     * @param value Property value
     * @returns The created property
     */
    updatePropertyWithValue (name: string, value: string|number|Object): Property
  }

  /** @class This class represents the "duration" value type, with various calculation and manipulation methods. */
  export declare class Duration {
    /** @constructs
     * @param data An object with members of the duration
     */
    constructor (data: {weeks: number, days: number, hours: number, minutes: number, seconds: number, isNegative: boolean})

    /** The days in this duration
     * @default 0
     */
    days: number

    /** The hours in this duration
     * @default 0
     */
    hours: number

    /** The class identifier.
     * @default 'icalduration'
     * @constant
     */
    icalclass: string

    /** The type name, to be used in the jCal object.
     * @default 'duration'
     * @constant
     */
    icaltype: string

    /** The seconds in this duration
     * @default false
     */
    isNegative: boolean

    /** The minutes in this duration
     * @default 0
     */
    minutes: number

    /** The seconds in this duration
     * @default 0
     */
    seconds: number

    /** The weeks in this duration
     * @default 0
     */
    weeks: number

    /** Creates a new {@link Duration} instance from the given data object.
     * @param aData An object with members of the duration
     * @returns The createad duration instance
     */
    static fromData(aData: { weeks: number; days: number; hours: number; minutes: number; seconds: number; isNegative: boolean }): Duration

    /** Returns a new {@link Duration} instance from the passed seconds value.
     * @param aSeconds The seconds to create the instance from
     * @returns The newly created duration instance
     */
    static fromSeconds(aSeconds: number): Duration

    /** Creates a new {@link Duration} instance from the passed string.
     * @param aStr The string to parse
     */
    static fromString(aStr: string): Duration

    /** Checks if the given string is an iCalendar duration value.
     * @param value The raw ical value
     * @returns True, if the given value is of the duration ical type
     */
    static isValueString(value: string): boolean

    /** Returns a clone of the duration object.
     * @returns The cloned object
     */
    clone(): Duration

    /** Compares the duration instance with another one.
     * @param aOther The instance to compare with
     * @returns -1, 0 or 1 for less/equal/greater
     */
    compare(aOther: Duration): number

    /** Sets up the current instance using members from the passed data object.
     * @param aData An object with members of the duration
     */
    fromData(aData: { weeks: number; days: number; hours: number; minutes: number; seconds: number; isNegative: boolean }): void

    /** Reads the passed seconds value into this duration object. Afterwards, members like {@link Duration.days days} and {@link Duration.weeks weeks} will be set up accordingly.
     * @param aSeconds The duration value in seconds
     * @returns Returns this instance
     */
    fromSeconds(aSeconds: number): Duration

    /** Normalizes the duration instance. For example, a duration with a value of 61 seconds will be normalized to 1 minute and 1 second. */
    normalize()

    /** Resets the duration instance to the default values, i.e. PT0S */
    reset()

    /** The iCalendar string representation of this duration. */
    toICALString(): string

    /** The duration value expressed as a number of seconds.
     * @returns The duration value in seconds
     */
    toSeconds(): number

    /** The string representation of this duration. */
    toString(): string
  }

  /** @class ICAL.js is organized into multiple layers. The bottom layer is a raw jCal object, followed by the component/property layer. The highest level is the event representation, which this class is part of. See the layers guide for more details. */
  export declare class Event {
    /** @constructs
     * @param component The ICAL.Component to base this event on
     * @param options Options for this event
     */
    constructor (component?: Component, options?: { strictExceptions: boolean, exceptions: Array<Component|Event> })

    /** The attendees in the event */
    readonly attendees: Array<Property>

    /** The event description. */
    description: string

    /** The duration. This can be the result directly from the property, or the duration calculated from start date and end date. Setting the property will remove any `dtend` properties. */
    duration: Duration

    /** The end date. This can be the result directly from the property, or the end date calculated from start date and duration. Setting the property will remove any duration properties. */
    endDate: Time

    /** List of related event exceptions. */
    exceptions: Array<Event>

    /** The location of the event. */
    location: string

    /** The organizer value as an uri. In most cases this is a mailto: uri, but it can also be something else, like urn:uuid:... */
    organizer: string

    /** The recurrence id for this event. See terminology for details. */
    recurrenceId: Time

    /** The sequence value for this event. Used for scheduling see terminology. */
    sequence: number

    /** The start date */
    startDate: Time

    /** When true, will verify exceptions are related by their UUID. */
    strictExceptions: boolean

    /** The event summary */
    summary: string

    /** The uid of this event */
    uid: string

    /** Finds the range exception nearest to the given date.
     * @param time usually an occurrence time of an event
     * @returns the related event/exception or null
     */
    findRangeException(time: Time): Event?;

    /** Returns the occurrence details based on its start time. If the occurrence has an exception will return the details for that exception. NOTE: this method is intend to be used in conjunction with the {@link Event.iterator iterator} method.
     * @param occurrence time occurrence
     * @returns Information about the occurrence
     */
    getOccurrenceDetails(occurrence: Time): Event.occurrenceDetails

    /** Returns the types of recurrences this event may have. Returned as an object with the following possible keys: - YEARLY - MONTHLY - WEEKLY - DAILY - MINUTELY - SECONDLY
     * @returns Object of recurrence flags
     */
    getRecurrenceTypes(): Object<Recur.frequencyValues, boolean>

    /** Checks if the event describes a recurrence exception. See terminology for details.
     * @returns True, if the event describes a recurrence exception
     */
    isRecurrenceException(): boolean

    /** Checks if the event is recurring
     * @returns True, if event is recurring
     */
    isRecurring(): boolean

    /** Builds a recur expansion instance for a specific point in time (defaults to startDate).
     * @param startTime Starting point for expansion
     * @returns Expansion object
     */
    iterator(startTime: Time): RecurExpansion

    /** Checks if this record is an exception and has the RANGE=THISANDFUTURE value.
     * @returns True, when exception is within range
     */
    modifiesFuture(): boolean

    /** Relates a given event exception to this object. If the given component does not share the UID of this event it cannot be related and will throw an exception. If this component is an exception it cannot have other exceptions related to it.
     * @param obj Component or event
     */
    relateException(obj: Component|Event): void

    /** The string representation of this event. */
    toString(): string

  }

  export declare namespace Event {
    /** This object is returned by {@link Event.getOccurrenceDetails getOccurrenceDetails}
     * @typedef {Object} occurrenceDetails
     * @memberof Event
    */
    declare type occurrenceDetails = {
      /** The passed in recurrence id */
      recurrenceId: Time;
      /** The occurrence */
      item: Event;
      /** The start of the occurrence */
      startDate: Time;
      /** The end of the occurrence */
      endDate: Time;
    }
  }

  /** @class Provides a layer on top of the raw jCal object for manipulating a single property, with its parameters and value. */
  export declare class Property {
    /** @constructs
     * @param jCal Raw jCal representation OR the new name of the property
     * @param parent Parent component
     */
    constructor(jcal: Array|String, parent?: Component)

    /** The name of this property, in lowercase. */
    readonly name: string

    /** The parent component for this property. */
    parent: Component

    /** The value type for this property */
    readonly type: string

    /** Create an {@link Property} by parsing the passed iCalendar string.
     * @param str The iCalendar string to parse
     * @param designSet The design data to use for this property
     * @return The created iCalendar property
     */
    static fromString(str: string, designSetopt?: design.designSet): Property

    /** Get the default type based on this property's name.
     * @return The default type for this property
     */
    getDefaultType(): string

    /** Gets first parameter on the property.
     * @param name Property name (lowercase)
     * @returns Property value
     */
    getFirstParameter(name: string): string

    /** Finds the first property value.
     * @returns First property value
     */
    getFirstValue(): string

    /** Gets a parameter on the property.
     * @param name Property name (lowercase)
     * @returns Property value
     */
    getParameter(name: string): Array|String

    /** Gets all values on the property. NOTE: this creates an array during each call.
     * @returns List of values
     */
    getValues(): Array

    /** Removes all values from this property */
    removeAllValues(): void

    /** Removes a parameter
     * @param name The parameter name
     */
    removeParameter(name: string): void

    /** Sets type of property and clears out any existing values of the current type.
     * @param type New iCAL type (see design.*.values)
     */
    resetType(type: string): void

    /** Sets a parameter on the property.
     * @param name The parameter name
     * @param value The parameter value
     */
    setParameter(name: string, value: Array|string): void

    /** Sets the current value of the property. If this is a multi-value property, all other values will be removed.
     * @param value New property value.
     */
    setValue(value: string|Object): void

    /** Sets the values of the property. Will overwrite the existing values. This can only be used for multi-value properties.
     * @param values An array of values
     */
    setValues(values: Array): void

    /** The string representation of this component. */
    toICALString(): string

    /** Returns the Object representation of this component. The returned object is a live jCal object and should be cloned if modified. */
    toJSON(): Object
  }

  /** @class This class represents the "recur" value type, with various calculation and manipulation methods. */
  export declare class Recur {
    /** @constructs
     * @param data An object with members of the recurrence
     */
    constructor(data: {
      freq?: Recur.frequencyValues;
      interval?: number;
      wkst?: Time.weekDay;
      until?: Time;
      count?: number;
      bysecond?: number[];
      byminute?: number[];
      byhour?: number[];
      byday?: string[];
      bymonthday?: number[];
      byyearday?: number[];
      byweekno?: number[];
      bymonth?: number[];
      bysetpos?: number[];
    })

    /** The maximum number of occurrences */
    count?: number

    /** The frequency value. */
    freq: Recur.frequencyValues

    /** The class identifier.
     * @constant
     * @default 'icalrecur'
     */
    icalclass: string

    /** The type name, to be used in the jCal object.
     * @constant
     * @default 'recur'
     */
    icaltype: string

    /** The interval value for the recurrence rule. */
    interval: number

    /** An object holding the BY-parts of the recurrence rule */
    parts: Object

    /** The end of the recurrence */
    until?: Time

    /** The week start day
     * @default Time.MONDAY
     */
    wkst: Time.weekDay

    /** Converts a recurrence string to a data object, suitable for the fromData method.
     * @param string The string to parse
     * @param fmtIcal If true, the string is considered to be an iCalendar string
     * @returns The recurrence instance
     */
    static _stringToData(string: string, fmtIcal: boolean): Recur

    /** Creates a new {@link Recur} instance using members from the passed data object.
     * @param aData An object with members of the recurrence
     */
    static fromData(aData: {
      freq?: Recur.frequencyValues;
      interval?: number;
      wkst?: Time.weekDay;
      until?: Time;
      count?: number;
      bysecond?: number[];
      byminute?: number[];
      byhour?: number[];
      byday?: string[];
      bymonthday?: number[];
      byyearday?: number[];
      byweekno?: number[];
      bymonth?: number[];
      bysetpos?: number[];
    })

    /** Creates a new {@link Recur} instance from the passed string.
     * @param string The string to parse
     * @returns The created recurrence instance
     */
    static fromString(string: string): Recur

    /** Convert an ical representation of a day (SU, MO, etc..) into a numeric value of that day.
     * @param string The iCalendar day name
     * @param aWeekStart The week start weekday, defaults to SUNDAY
     * @returns Numeric value of given day
     */
    static icalDayToNumericDay(string: string, aWeekStart?: Time.weekDay): number

    /** Convert a numeric day value into its ical representation (SU, MO, etc..)
     * @param num Numeric value of given day
     * @param aWeekStart The week start weekday, defaults to SUNDAY
     * @returns The ICAL day value, e.g SU,MO,...
     */
    static numericDayToIcalDay(num: number, aWeekStart: Time.weekDay): string

    /** Adds a component (part) to the recurrence rule. This is not a component in the sense of {@link Component}, but a part of the recurrence rule, i.e. BYMONTH.
     * @param aType The name of the component part
     * @param aValue The component value
     */
    addComponent(aType: string, aValue: Array|string): void

    /** Returns a clone of the recurrence object.
     * @returns The cloned object
     */
    clone(): Recur

    /** Sets up the current instance using members from the passed data object.
     * @param data An object with members of the recurrence
     */
    fromData(data: {
      freq?: Recur.frequencyValues;
      interval?: number;
      wkst?: Time.weekDay;
      until?: Time;
      count?: number;
      bysecond?: number[];
      byminute?: number[];
      byhour?: number[];
      byday?: string[];
      bymonthday?: number[];
      byyearday?: number[];
      byweekno?: number[];
      bymonth?: number[];
      bysetpos?: number[];
    })

    /** Gets (a copy) of the requested component value.
     * @param aType The component part name
     * @returns The component part value
     */
    getComponent(aType: string): Array

    /** Retrieves the next occurrence after the given recurrence id. See the guide on terminology for more details. NOTE: Currently, this method iterates all occurrences from the start date. It should not be called in a loop for performance reasons. If you would like to get more than one occurrence, you can iterate the occurrences manually, see the example on the {@link Recur.iterator iterator} method.
     * @param aStartTime The start of the event series
     * @param aRecurrenceId The date of the last occurrence
     * @return The next occurrence after
     */
    getNextOccurrence(aStartTime: Time, aRecurrenceId: Time): Time

    /** Checks if the current rule has a count part, and not limited by an until part.
     * @returns True, if the rule is by count
     */
    isByCount(): boolean

    /** Checks if the current rule is finite, i.e. has a count or until part.
     * @returns True, if the rule is finite
     */
    isFinite(): boolean

    /** Create a new iterator for this recurrence rule. The passed start date must be the start date of the event, not the start of the range to search in.
     *
     * @example
     * var recur = comp.getFirstPropertyValue('rrule');
     * var dtstart = comp.getFirstPropertyValue('dtstart');
     * var iter = recur.iterator(dtstart);
     * for (var next = iter.next(); next; next = iter.next()) {
     *   if (next.compare(rangeStart) < 0) {
     *     continue;
     *   }
     *   console.log(next.toString());
     * }
     * 
     * @param aStart The item's start date
     * @returns The recurrence iterator
     */
    iterator(aStart: Time): RecurIterator

    /** Sets the component value for the given by-part.
     * @param aType The component part name
     * @param aValues The component values
     */
    setComponent(aType: string, aValues: Array): void

    /** The jCal representation of this recurrence type. */
    toJSON(): Object

    /** The string representation of this recurrence rule. */
    toString(): string
  }

  export declare namespace Recur {
    /** Possible frequency values for the FREQ part (YEARLY, MONTHLY, WEEKLY, DAILY, HOURLY, MINUTELY, SECONDLY)
     * @memberof Recur
     */
    declare type frequencyValues = 'YEARLY'|'MONTHLY'|'WEEKLY'|'DAILY'|'HOURLY'|'MINUTELY'|'SECONDLY'
  }

  /** @class Primary class for expanding recurring rules. Can take multiple rrules, rdates, exdate(s) and iterate (in order) over each next occurrence. Once initialized this class can also be serialized saved and continue iteration from the last point. NOTE: it is intended that this class is to be used with ICAL.Event which handles recurrence exceptions. */
  export declare class RecurExpansion {
    /** @constructs
     * @param options Recurrence expansion options
     * 
     * @example
     * // assuming event is a parsed ical component
     * var event;
     * 
     * var expand = new ICAL.RecurExpansion({
     *   component: event,
     *   dtstart: event.getFirstPropertyValue('dtstart')
     * });
     * 
     * // remember there are infinite rules
     * // so its a good idea to limit the scope
     * // of the iterations then resume later on.
     * 
     * // next is always an ICAL.Time or null
     * var next;
     * 
     * while (someCondition && (next = expand.next())) {
     *   // do something with next
     * }
     * 
     * // save instance for later
     * var json = JSON.stringify(expand);
     * 
     * //...
     * 
     * // NOTE: if the component's properties have
     * //       changed you will need to rebuild the
     * //       class and start over. This only works
     * //       when the component's recurrence info is the same.
     * var expand = new ICAL.RecurExpansion(JSON.parse(json));
     */
    constructor(options: { dtstart: Time; component?: Component })

    /** True when iteration is fully completed. */
    complete: boolean

    /** Start date of recurring rules. */
    dtstart: Time

    /** Last expanded time */
    last: Time

    /** Initialize the recurrence expansion from the data object. The options object may also contain additional members, see the constructor for more details.
     * @param options Recurrence expansion options
     */
    fromData(options: { dtstart: Time; component?: Component }): void

    /** Retrieve the next occurrence in the series. */
    next(): Time

    /** Converts object into a serialize-able format. This format can be passed back into the expansion to resume iteration. */
    toJSON(): Object
  }

  /** @class An iterator for a single recurrence rule. This class usually doesn't have to be instanciated directly, the convenience method {@link Recur#iterator} can be used. */
  export declare class RecurIterator {
    /** @constructs
     * @param options The iterator options
     */
    constructor(options: { rule: Recur; dtstart: Time; initialized?: boolean })

    /** True when iteration is finished. */
    completed: boolean

    /** The start date of the event being iterated. */
    dtstart: Time

    /** The last occurrence that was returned from the {@link RecurIterator#next} method. */
    last: Time

    /** The sequence number from the occurrence */
    occurrence_number: number

    /** The rule that is being iterated */
    rule: Recur

    /** Initialize the recurrence iterator from the passed data object. This method is usually not called directly, you can initialize the iterator through the constructor.
     * @param options The iterator options
     */
    fromData(options: { rule: Recur; dtstart: Time; initialized?: boolean }): void

    /** Retrieve the next occurrence from the iterator. */
    next(): Time

    /**
     * @param dow (eg: '1TU', '-1MO')
     * @param aWeekStart The week start weekday
     * @returns [pos, numericDow] (eg: [1, 3]) numericDow is relative to aWeekStart
     */
    ruleDayOfWeek(dow: string, aWeekStart?: Time.weekDay): [number, number]

    /** Convert iterator into a serialize-able object. Will preserve current iteration sequence to ensure the seamless continuation of the recurrence rule. */
    toJSON(): Object
  }

  /** @class iCalendar Time representation (similar to JS Date object). Fully independent of system (OS) timezone / time. Unlike JS Date, the month January is 1, not zero. */
  export declare class Time {
    /** The year for this date */
    year: number
    /** The month for this date */
    month: number
    /** The day for this date */
    day: number
    /** The hour for this date */
    hour: number
    /** The minute for this date */
    minute: number
    /** The second for this date */
    second: number
    /** If true, the instance represents a date (as opposed to a date-time) */
    isDate: boolean

    /** @constructs
     * @param data Time initialization
     * @param zone: ICAL.Timezone
     * 
     * @example
     * var time = new ICAL.Time({
     *   year: 2012,
     *   month: 10,
     *   day: 11
     *   minute: 0,
     *   second: 0,
     *   isDate: false
     * });
     */
    constructor(data: {
      /** The year for this date */
      year?: number;
      /** The month for this date */
      month?: number;
      /** The day for this date */
      day?: number;
      /** The hour for this date */
      hour?: number;
      /** The minute for this date */
      minute?: number;
      /** The second for this date */
      second?: number;
      /** If true, the instance represents a date (as opposed to a date-time) */
      isDate?: boolean;
    }, zone: Timezone)

    /** The days that have passed in the year after a given month. The array has two members, one being an array of passed days for non-leap years, the other analog for leap years.
     * 
     * @example
     * var isLeapYear = ICAL.Time.isLeapYear(year);
     * var passedDays = ICAL.Time.daysInYearPassedMonth[isLeapYear][month];
     */
    static daysInYearPassedMonth: number[][]

    /** The default weekday for the WKST part.
     * @default Time.MONDAY
     * @constant
     */
    static DEFAULT_WEEK_START: number

    /** January 1st, 1970 as an ICAL.Time.
     * @constant
     */
    static epochTime: Time

    /** The class identifier.
     * @default 'icaltime'
     * @constant
     */
    icalclass: string

    /** The type name, to be used in the jCal object. This value may change and is strictly defined by the isDate member.
     * @default 'date-time'
     */
    readonly icaltype: 'date-time'|'date'

    /** The timezone for this time. */
    zone: Timezone

    /** Returns the days in the given month
     * @param month The month to check
     * @param year The year to check
     * @returns The number of days in the month
     */
    static daysInMonth(month: number, year: number): number

    /** Creates a new ICAL.Time instance from the the passed data object.
     * @param aData Time initialization
     * @param aZone Timezone this position occurs in
     */
    static fromData(aData: {
      /** The year for this date */
      year?: number;
      /** The month for this date */
      month?: number;
      /** The day for this date */
      day?: number;
      /** The hour for this date */
      hour?: number;
      /** The minute for this date */
      minute?: number;
      /** The second for this date */
      second?: number;
      /** If true, the instance represents a date (as opposed to a date-time) */
      isDate?: boolean;
    }, aZone?: Timezone): void

    /** Returns a new ICAL.Time instance from a date string, e.g 2015-01-02.
     * @param aValue The string to create from
     * @returns The date/time instance
     */
    static fromDateString(aValue: string): Time

    /** Returns a new ICAL.Time instance from a date-time string, e.g 2015-01-02T03:04:05. If a property is specified, the timezone is set up from the property's TZID parameter.
     * @param aValue The string to create from
     * @param prop The property the date belongs to
     * @returns The date/time instance
     */
    static fromDateTimeString(aValue: string, prop?: Property): Time

    /** Create a new ICAL.Time from the day of year and year. The date is returned in floating timezone.
     * @param aDayOfYear The day of year
     * @param aYear The year to create the instance in
     * @returns The created instance with the calculated date
     */
    static fromDayOfYear(aDayOfYear: number, aYear: number): Time

    /** Creates a new ICAL.Time instance from the given Javascript Date.
     * @param aDate The Javascript Date to read, or null to reset
     * @param useUTC If true, the UTC values of the date will be used
     */
    static fromJSDate(aDate?: Date, useUTC: boolean): Time

    /** Returns a new ICAL.Time instance from a date or date-time string.
     * @param aValue The string to create from
     * @param prop The property the date belongs to
     * @returns The date/time instance
     */
    static fromString(aValue: string, prop?: Property): Time

    /** Returns a new ICAL.Time instance from a date string, e.g 2015-01-02.
     * @deprecated Use {@link Time.fromDateString} instead
     * @param str The string to create from
     * @returns The date/time instance
     */
    static fromStringv2(str: string): Time

    /** Get the dominical letter for the given year. Letters range from A - G for common years, and AG to GF for leap years.
     * @param yr The year to retrieve the letter for
     * @returns The dominical letter.
     */
    static getDominicalLetter(yr: number): string

    /** Checks if the year is a leap year
     * @param year The year to check
     * @returns True, if the year is a leap year
     */
    static isLeapYear(year: number): boolean

    /** Creates a new ICAL.Time instance from the current moment. */
    static now(): Time

    /** Returns the date on which ISO week number 1 starts.
     * @param aYear The year to search in
     * @param aWeekStart The week start weekday, used for calculation.
     * @returns The date on which week number 1 starts
     */
    static weekOneStarts(aYear: number, aWeekStart?: Time.weekDay)

    /** Adds the duration to the current time. The instance is modified in place.
     * @param aDuration The duration to add
     */
    addDuration(aDuration: Duration): void

    /** Adjust the date/time by the given offset
     * @param aExtraDays The extra amount of days
     * @param aExtraHours The extra amount of hours
     * @param aExtraMinutes The extra amount of minutes
     * @param aExtraSeconds The extra amount of seconds
     * @param aTime The time to adjust, defaults to the current instance.
     */
    adjust(aExtraDays: number, aExtraHours: number, aExtraMinutes: number, aExtraSeconds: number, aTime?: number): void

    /** Returns a clone of the time object.
     * @returns The cloned object
     */
    clone(): Time

    /** Compares the {@link Time} instance with another one.
     * @param aOther The instance to compare with
     * @returns -1, 0 or 1 for less/equal/greater
     */
    compare(aOther: Duration): number

    /** Compares only the date part of this instance with another one.
     * @param other The instance to compare with
     * @param tz The timezone to compare in
     * @returns -1, 0 or 1 for less/equal/greater
     */
    compareDateOnlyTz(other: Duration|Time, tz: Timezone): number

    /** Convert the instance into another timzone. The returned {@link Time} instance is always a copy.
     * @param zone The zone to convert to
     * @returns The copy, converted to the zone
     */
    convertToZone(zone: Timezone): Time

    /** Calculate the day of week.
     * @param aWeekStart The week start weekday, defaults to SUNDAY
     */
    dayOfWeek(aWeekStart?: Time.weekDay): Time.weekDay

    /** Calculate the day of year. */
    dayOfYear(): number

    /** Returns a copy of the current date/time, shifted to the end of the month. The resulting {@link Time} instance is of icaltype date, even if this is a date-time.
     * @returns The end of the month (cloned)
     */
    endOfMonth(): Time

    /** Returns a copy of the current date/time, shifted to the end of the week. The resulting {@link Time} instance is of icaltype date, even if this is a date-time.
     * @param aWeekStart The week start weekday, defaults to SUNDAY
     * @returns The end of the week (cloned)
     */
    endOfWeek(aWeekStart?: Time.weekDay): Time

    /** Returns a copy of the current date/time, shifted to the end of the year. The resulting {@link Time} instance is of icaltype date, even if this is a date-time.
     * @returns The end of the year (cloned)
     */
    endOfYear(): Time

    /** Sets up the current instance using members from the passed data object.
     * @param aData Time initialization
     * @param aZone Timezone this position occurs in
     */
    fromData(aData: {
      /** The year for this date */
      year?: number;
      /** The month for this date */
      month?: number;
      /** The day for this date */
      day?: number;
      /** The hour for this date */
      hour?: number;
      /** The minute for this date */
      minute?: number;
      /** The second for this date */
      second?: number;
      /** If true, the instance represents a date (as opposed to a date-time) */
      isDate?: boolean;
    }, aZone?: Timezone): void

    /** Set up the current instance from the Javascript date value.
     * @param aDate The Javascript Date to read, or null to reset
     * @param useUTC If true, the UTC values of the date will be used
     */
    fromJSDate(aDate?: Date, useUTC: boolean): void

    /** Sets up the current instance from unix time, the number of seconds since January 1st, 1970.
     * @param seconds The seconds to set up with
     */
    fromUnixTime(seconds: number): void

    /** Get the dominical letter for the current year. Letters range from A - G for common years, and AG to GF for leap years.
     * @param yr The year to retrieve the letter for
     * @returns The dominical letter.
     */
    getDominicalLetter(yr: number): string

    /** Checks if current time is the nth weekday, relative to the current month. Will always return false when rule resolves outside of current month.
     * @param aDayOfWeek Day of week to check
     * @param aPos Relative position
     * @results True, if its the nth weekday
     */
    isNthWeekDay(aDayOfWeek: Time.weekDay, aPos: number): boolean

    /** Finds the nthWeekDay relative to the current month (not day). The returned value is a day relative the month that this month belongs to so 1 would indicate the first of the month and 40 would indicate a day in the following month.
     * @param aDayOfWeek Day of the week see the day name constants
     * @param aPos Nth occurrence of a given week day values of 1 and 0 both indicate the first weekday of that type. aPos may be either positive or negative
     * @returns numeric value indicating a day relative to the current month of this time object
     */
    nthWeekDay(aDayOfWeek: number, aPos: number): number

    /** Reset the time instance to epoch time */
    reset(): void

    /** Reset the time instance to the given date/time values.
     * @param year The year to set
     * @param month The month to set
     * @param day The day to set
     * @param hour The hour to set
     * @param minute The minute to set
     * @param second The second to set
     * @param timezone The timezone to set
     */
    resetTo(year: number, month: number, day: number, hour: number, minute: number, second: number, timezone: Timezone): void

    /** First calculates the start of the week, then returns the day of year for this date. If the day falls into the previous year, the day is zero or negative.
     * @param aFirstDayOfWeek The week start weekday, defaults to SUNDAY
     * @returns The calculated day of year
     */
    startDoyWeek(aFirstDayOfWeek?: Time.weekDay): number

    /** Returns a copy of the current date/time, rewound to the start of the month. The resulting ICAL.Time instance is of icaltype date, even if this is a date-time.
     * @returns The start of the month (cloned)
     */
    startOfMonth(): Time

    /** Returns a copy of the current date/time, rewound to the start of the week. The resulting ICAL.Time instance is of icaltype date, even if this is a date-time.
     * @param aWeekStart The week start weekday, defaults to SUNDAY
     * @returns The start of the week (cloned)
     */
    startOfWeek(aWeekStart?: Time.weekDay): Time

    /** Returns a copy of the current date/time, rewound to the start of the year. The resulting ICAL.Time instance is of icaltype date, even if this is a date-time.
     * @returns The start of the year (cloned)
     */
    startOfYear(): Time

    /** Subtract the date details (_excluding_ timezone). Useful for finding the relative difference between two time objects excluding their timezone differences.
     * @param aDate The date to substract
     * @returns The difference as a duration
     */
    subtractDate(aDate: Time): Duration

    /** Subtract the date details, taking timezones into account.
     * @param aDate The date to subtract
     * @returns The difference in duration
     */
    subtractDateTz(aDate: Time): Duration

    /** Returns an RFC 5545 compliant ical representation of this object.
     * @returns ical date/date-time
     */
    toICALString(): string

    /** Converts the current instance to a Javascript date */
    toJSDate(): Date

    /** Converts time to into Object which can be serialized then re-created using the constructor.
     * 
     * @example
     * // toJSON will automatically be called
     * var json = JSON.stringify(mytime);
     * 
     * var deserialized = JSON.parse(json);
     * 
     * var time = new ICAL.Time(deserialized);
     */
    toJSON(): Object

    /** The string representation of this date/time, in jCal form (including : and - separators). */
    toString(): string

    /** Converts the current instance to seconds since January 1st 1970.
     * @returns Seconds since 1970
     */
    toUnixTime(): number

    /** Calculates the UTC offset of the current date/time in the timezone it is in.
     * @returns UTC offset in seconds
     */
    utcOffset(): number

    /** Calculates the ISO 8601 week number. The first week of a year is the week that contains the first Thursday. The year can have 53 weeks, if January 1st is a Friday. Note there are regions where the first week of the year is the one that starts on January 1st, which may offset the week number. Also, if a different week start is specified, this will also affect the week number.
     * @param aWeekStart The weekday the week starts with
     * @returns The ISO week number
     */
    weekNumber(aWeekStart: Time.weekDay): number
  }

  export declare namespace Time {
    /** The weekday, 1 = SUNDAY, 7 = SATURDAY. Access via ICAL.Time.MONDAY, ICAL.Time.TUESDAY, ... */
    type weekDay = 1|2|3|4|5|6|7

    const SUNDAY: Time.weekDay = 1
    const MONDAY: Time.weekDay = 2
    const TUESDAY: Time.weekDay = 3
    const WEDNESDAY: Time.weekDay = 4
    const THURSDAY: Time.weekDay = 5
    const FRIDAY: Time.weekDay = 6
    const SATURDAY: Time.weekDay = 7
  }

  /** @class Timezone representation, created by passing in a tzid and component.
   * @example
   * var vcalendar;
   * var timezoneComp = vcalendar.getFirstSubcomponent('vtimezone');
   * var tzid = timezoneComp.getFirstPropertyValue('tzid');
   * 
   * var timezone = new ICAL.Timezone({
   *   component: timezoneComp,
   *   tzid
   * });
   */
  export declare class Timezone {
    /** @constructs
     * @param data options for class
     */
    constructor(data: Component|{
      /** If data is a simple object, then this member can be set to either a string containing the component data, or an already parsed Component */
      component: string|Component;
      /** The timezone identifier */
      tzid: string;
      /** The timezone locationw */
      location: string;
      /** An alternative string representation of the timezone */
      tznames: string;
      /** The latitude of the timezone */
      latitude: number;
      /** The longitude of the timezone */
      longitude: number;
    })

    /** The instance describing the local timezone
     * @constant
     */
    static localTimezone: Timezone

    /** The instance describing the UTC timezone
     * @constant
     */
    static utcTimezone: Timezone

    /** The vtimezone component for this timezone. */
    component: Component

    /** The class identifier.
     * @constant
     * @default 'icaltimezone'
     */
    icalclass: string

    /** The primary latitude for the timezone. */
    latitude: number

    /** Timezone location */
    location: string

    /** The primary longitude for the timezone. */
    longitude: number

    /** Timezone identifier */
    tzid: string

    /** Alternative timezone name, for the string representation */
    tznames: string

    /** Convert the date/time from one zone to the next.
     * @param tt The time to convert
     * @param from_zone	The source zone to convert from
     * @param to_zone The target zone to convert to
     * @results The converted date/time object
     */
    static convert_time(tt: Time, from_zone: Timezone, to_zone: Timezone): Time

    /** Creates a new ICAL.Timezone instance from the passed data object.
     * @param aData options for class
     */
    static fromData(aData: Component|{
      /** If data is a simple object, then this member can be set to either a string containing the component data, or an already parsed Component */
      component: string|Component;
      /** The timezone identifier */
      tzid: string;
      /** The timezone locationw */
      location: string;
      /** An alternative string representation of the timezone */
      tznames: string;
      /** The latitude of the timezone */
      latitude: number;
      /** The longitude of the timezone */
      longitude: number;
    }): Timezone

    /** Sets up the current instance using members from the passed data object.
     * @param aData options for class
     */
    fromData(aData: Component|{
      /** If data is a simple object, then this member can be set to either a string containing the component data, or an already parsed Component */
      component: string|Component;
      /** The timezone identifier */
      tzid: string;
      /** The timezone locationw */
      location: string;
      /** An alternative string representation of the timezone */
      tznames: string;
      /** The latitude of the timezone */
      latitude: number;
      /** The longitude of the timezone */
      longitude: number;
    }): void

    /** The string representation of this timezone. */
    toString(): string

    /** Finds the utcOffset the given time would occur in this timezone.
     * @param tt The time to check for
     * @returns utc offset in seconds
     */
    utcOffset(tt: Time): number
  }

  /** The design data, used by the parser to determine types for properties and other metadata needed to produce correct jCard/jCal data. */
  export declare namespace design {
    /** Holds the design set for known top-level components
     * @static
     * 
     * @example
     * var propertyName = 'fn';
     * var componentDesign = ICAL.design.components.vcard;
     * var propertyDetails = componentDesign.property[propertyName];
     * if (propertyDetails.defaultType == 'text') {
     *   // Yep, sure is...
     * }
     */
    declare let components: {
      /** vCard VCARD */
      vcard: design.designSet;
      /** iCalendar VEVENT */
      vevent: design.designSet;
      /** iCalendar VTODO */
      vtodo: design.designSet;
      /** iCalendar VJOURNAL */
      vjournal: design.designSet;
      /** iCalendar VALARM */
      valarm: design.designSet;
      /** iCalendar VTIMEZONE */
      vtimezone: design.designSet;
      /** iCalendar DAYLIGHT */
      daylight: design.designSet;
      /** iCalendar STANDARD */
      standard: design.designSet;
    }

    /** The default set for new properties and components if none is specified.
     * @static
     */
    declare let defaultSet: design.designSet

    /** The default type for unknown properties
     * @static
     */
    declare let defaultType: string

    /** The design set for iCalendar (rfc5545/rfc7265) components.
     * @static
     */
    declare let icalendar: design.designSet

    /** Can be set to false to make the parser more lenient.
     * @static
     * @default true
     */
    declare let strict: boolean

    /** The design set for vCard (rfc6350/rfc7095) components.
     * @static
     */
    declare let vcard: design.designSet

    /** The design set for vCard (rfc2425/rfc2426/rfc7095) components.
     * @static
     */
    declare let vcard3: design.designSet

    /** Gets the design set for the given component name.
     * @param componentName The name of the component
     * @returns The design set for the component
     * @static
     */
    declare function getDesignSet(componentName: string): design.designSet

    /** A designSet describes value, parameter and property data. It is used by ther parser and stringifier in components and properties to determine they should be represented. */
    declare type designSet = {
      /** Definitions for value types, keys are type names */
      value: Object;
      /** Definitions for params, keys are param names */
      param: Object;
      /** 	Defintions for properties, keys are property names */
      property: Object;
    }
  }

  // ToDo
}
