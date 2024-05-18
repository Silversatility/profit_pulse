import { CustomerAPI } from '../../api';

export const LIST_CALENDAR_EVENTS_REQUEST = 'LIST_CALENDAR_EVENTS_REQUEST';
export const LIST_CALENDAR_EVENTS_SUCCESS = 'LIST_CALENDAR_EVENTS_SUCCESS';
export const LIST_CALENDAR_EVENTS_FAILED = 'LIST_CALENDAR_EVENTS_FAILED';


const listCalendarEventsRequest = () => ({ type: LIST_CALENDAR_EVENTS_REQUEST });
const listCalendarEventsSuccess = (payload) => ({ type: LIST_CALENDAR_EVENTS_SUCCESS, payload });
const listCalendarEventsFailed = (error) => ({ type: LIST_CALENDAR_EVENTS_FAILED, error });

export const listCalendarEvents = () => {
  return async (dispatch) => {
    let payload = {};
    dispatch(listCalendarEventsRequest());
    try {
      const response = await CustomerAPI.calendarEvents();
      const calendarEvents = response.data;
      const parsedEvents = {};
      calendarEvents.map((event) => {
        if (! parsedEvents[event.active_date]) {
          parsedEvents[event.active_date] = [];
        }
        parsedEvents[event.active_date].push({ text: `Implementation - ${event.business_name}` });
        if (! parsedEvents[event.software_install]) {
          parsedEvents[event.software_install] = [];
        }
        parsedEvents[event.software_install].push({ text: `Software Install - ${event.business_name}` });
      });
      payload.results = parsedEvents;
      dispatch(listCalendarEventsSuccess(payload));
    } catch (error) {
      dispatch(listCalendarEventsFailed(error.response.data));
    }
  };
};
