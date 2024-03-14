import React, { useState, useEffect } from 'react';
import { db, apiCalendar } from '../firebase.config';
import { collection, getDocs, onSnapshot } from 'firebase/firestore';
import FullCalendar from "@fullcalendar/react";
import { formatDate } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import {
  Box, List, ListItem, ListItemText, Typography, useTheme,
} from "@mui/material";
import Header from "../components/Header";
import { tokens } from "../theme";

const Calendar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [events, setEvents] = useState([]); 
  const [currentEvents, setCurrentEvents] = useState([]);
  const [followUpevents, setfollowUpevents] = useState([]);

// Helper function to check if two dates are on the same day
const isSameDay = (d1, d2) => {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
};

//  Sort the events by date
 events.sort((a, b) => new Date(a.date) - new Date(b.date));

  //new event
  const handleDateClick = async (selected) => {
    try {
      const title = prompt("Please enter a new title for your event");
      const calendarApi = selected.view.calendar;
      calendarApi.unselect();
  
      if (title) {
        const newEvent = {
          id: `${selected.dateStr}-${title}`,
          title,
          start: selected.startStr,
          end: selected.endStr,
          allDay: selected.allDay,
        };
  
        calendarApi.addEvent(newEvent);
  
        // Create event in Google Calendar
        if (apiCalendar.sign) {
          const event = {
            summary: title,
            start: {
              dateTime: new Date(selected.startStr).toISOString(),
              timeZone: 'Asia/Manila',
            },
            end: {
              dateTime: new Date(selected.endStr).toISOString(),
              timeZone: 'Asia/Manila',
            },
          };
  
          const response = await apiCalendar.createEvent(event);
          if (response.status === 200) {
            console.log('Event created successfully in Google Calendar');
          } else {
            console.error('Failed to create event in Google Calendar', response.result.error);
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
  };  

//List upcoming events from Google Calendar
useEffect(() => {
  if (apiCalendar.sign) {
    apiCalendar.listUpcomingEvents(50)
      .then(({ result }) => {
        setEvents(result.items.map(event => ({
          title: event.summary,
          start: event.start.dateTime || event.start.date, // If it's an all-day event, it will be in the date property
          end: event.end.dateTime || event.end.date,
          allDay: event.start.date ? true : false,
        })));
      });
  }
}, []);

  return (
    <Box m="20px">
      <Header title="Calendar" />

      <Box display="flex" justifyContent="space-between">
        {/* CALENDAR SIDEBAR */}
        <Box
          flex="1 1 20%"
          backgroundColor={colors.primary[400]}
          p="15px"
          borderRadius="4px"
        >
          <Typography variant="h5">Events</Typography>
          <List>
          {currentEvents.map((event, index) => (
              <ListItem
                key={event.id || index}
                sx={{
                  backgroundColor: colors.greenAccent[500],
                  margin: "10px 0",
                  borderRadius: "2px",
                }}
              >
                <ListItemText
                  primary={event.title}
                  secondary={
                    <Typography>
                      {formatDate(event.start, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>

        {/* CALENDAR */}
        <Box flex="1 1 100%" ml="15px">
          <FullCalendar
            height="75vh"
            plugins={[
              dayGridPlugin,
              timeGridPlugin,
              interactionPlugin,
              listPlugin,
            ]}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay,listMonth",
            }}
            initialView="dayGridMonth"
            events={events}
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            select={handleDateClick}
            eventsSet={(events) => setCurrentEvents(events)}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Calendar;
