import { Box, IconButton, useTheme } from "@mui/material";
import React, { useContext, useState, useEffect } from "react";
import { ColorModeContext, tokens } from "../../theme";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import Header from "../../components/Header";
import { apiCalendar } from '../../firebase.config';
//import InputBase from "@mui/material/InputBase";
//import SearchIcon from "@mui/icons-material/Search";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';


import { db } from "../../firebase.config";
import {
  doc,
  collection,
  getDoc,
  addDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";

dayjs.extend(utc);
dayjs.extend(timezone);

const Topbar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);

  const [events, setEvents] = useState([]);
  const [value, setValue] = React.useState(
    dayjs.tz('2024-01-14T15:30', 'Asia/Manila'),
  );

  // Fetch today's events from Google Calendar
  useEffect(() => {
    if (apiCalendar.sign) {
      apiCalendar.listUpcomingEvents(10)
        .then(({ result }) => {
          const now = new Date();
          const todayEvents = result.items.filter(event => {
            const start = new Date(event.start.dateTime || event.start.date);
            return start.getDate() === now.getDate() &&
              start.getMonth() === now.getMonth() &&
              start.getFullYear() === now.getFullYear();
          });
  
          setEvents(todayEvents.map(event => ({
            title: event.summary,
            start: event.start.dateTime || event.start.date, // If it's an all-day event, it will be in the date property
            end: event.end.dateTime || event.end.date,
            allDay: event.start.date ? true : false,
          })));
        });
    }
  }, []);
  
  const handleClick = () => {
    alert(events.map(event => `${event.title}: ${event.start} - ${event.end}`).join('\n'));
  };
  

  return (
    <Box display="flex" justifyContent="space-between" p={2}>
      <Header title="PEDTB-CI"/>
      {/* SEARCH BAR */}
      <Box
        display="flex"
        backgroundColor={colors.primary[400]}
        borderRadius="3px"
      >
        {/* <InputBase sx={{ ml: 2, flex: 1 }} placeholder="Search" />
        <IconButton type="button" sx={{ p: 1 }}>
          <SearchIcon />
        </IconButton> */}
      </Box>


    {/* <LocalizationProvider dateAdapter={AdapterDayjs}>

        <DateTimePicker 
          label={'Value timezone: "Asia/Manila"'}
          value={value}
          onChange={setValue}
        />
        <p>
          Stored value: {value == null ? 'null' : value.format()}
        </p>

    </LocalizationProvider> */}


      {/* ICONS */}
      <Box display="flex">
        <IconButton onClick={colorMode.toggleColorMode}>
          {theme.palette.mode === "dark" ? (
            <DarkModeOutlinedIcon />
          ) : (
            <LightModeOutlinedIcon />
          )}
        </IconButton>
        <IconButton
          onClick={handleClick}
        >
          <NotificationsOutlinedIcon />
        </IconButton>
        <IconButton>
          <SettingsOutlinedIcon />
        </IconButton>
        <IconButton>
          <PersonOutlinedIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default Topbar;
