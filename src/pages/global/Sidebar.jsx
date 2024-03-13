import React, { useState, useEffect } from 'react';
import {db, auth, apiCalendar } from '../../firebase.config';
import { doc, getDoc } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from 'firebase/auth';
import { ProSidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Box, IconButton, Typography, useTheme } from "@mui/material";
import "react-pro-sidebar/dist/css/styles.css";
import { tokens } from "../../theme";
import { usePatientInfo } from '../../PatientInfoContext';
import ApiCalendar from 'react-google-calendar-api';

// Import Icons
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import FormatListNumberedOutlinedIcon from '@mui/icons-material/FormatListNumberedOutlined';
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import ContactsOutlinedIcon from "@mui/icons-material/ContactsOutlined";
import ReceiptOutlinedIcon from "@mui/icons-material/ReceiptOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
//import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
//import PieChartOutlineOutlinedIcon from "@mui/icons-material/PieChartOutlineOutlined";
//import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import InventoryIcon from '@mui/icons-material/Inventory';
import NoteAddIcon from '@mui/icons-material/NoteAdd';


const Item = ({ title, to, icon, selected, setSelected }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <MenuItem
      active={selected === title}
      style={{
        color: colors.grey[100],
      }}
      onClick={() => setSelected(title)}
      icon={icon}
    >
      <Typography>{title}</Typography>
      <Link to={to} />
    </MenuItem>
  );
};

const Sidebar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selected, setSelected] = useState("Dashboard");

  const { patientInfoId } = usePatientInfo();
  // Define a dynamic route for the "General Information" based on the user role
  const getGeneralInfoRoute = () => {
    if (userRole === 'Parent' && patientInfoId) {
      return `/patientinfo/${patientInfoId}`; // If the user is a 'Parent', use the specific patient info ID
    }
    return '/patientinfo'; // For all other roles, use the general patient info route
  };
  
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      apiCalendar.handleSignoutClick();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate("/login");
    } catch (error) {
      console.error(error);
    }
  }


  // Determine if the current user is allowed to see the item based on their role
  const canView = (title) => {
    switch (userRole) {
      case 'Admin':
        return true; // Admin can view all items
      case 'Parent':
        return title === "Calendar" || title === "General Information"; // Parent can only view these items
      default:
        return title !== "User List"; // All other roles can view everything except "User List"
    }
  };

  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    // Fetch the user role when the component mounts or auth.currentUser changes
    const fetchUserRole = async () => {
      if (auth.currentUser) {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();
          setUserRole(userData.role); // Set the user role
        } else {
          console.error("User document not found");
        }
      }
    };

    fetchUserRole();
  }, [auth.currentUser]);
  

  return (
    <Box
      sx={{
        "& .pro-sidebar-inner": {
          background: `${colors.primary[400]} !important`,
        },
        "& .pro-icon-wrapper": {
          backgroundColor: "transparent !important",
        },
        "& .pro-inner-item": {
          padding: "5px 35px 5px 20px !important",
        },
        "& .pro-inner-item:hover": {
          color: "#868dfb !important",
        },
        "& .pro-menu-item.active": {
          color: "#6870fa !important",
        },
      }}
    >
      <ProSidebar collapsed={isCollapsed}>
        <Menu iconShape="square">
          {/* LOGO AND MENU ICON */}
          <MenuItem
            onClick={() => setIsCollapsed(!isCollapsed)}
            icon={isCollapsed ? <MenuOutlinedIcon /> : undefined}
            style={{
              margin: "10px 0 20px 0",
              color: colors.grey[100],
            }}
          >
            {!isCollapsed && (
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                ml="15px"
              >
                <Typography variant="h3" color={colors.grey[100]}>
                   PedTB CI
                </Typography>
                <IconButton onClick={() => setIsCollapsed(!isCollapsed)}>
                  <MenuOutlinedIcon />
                </IconButton>
              </Box>
            )}
          </MenuItem>

          <Box paddingLeft={isCollapsed ? undefined : "10%"}>
          {canView('Dashboard') && (
            <Item
              title="Dashboard"
              to="/"
              icon={<HomeOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            )}

            {/* Admin specific items */}
            {canView('User List') && (
                <Item
                  title="User List"
                  to="/userlist"
                  icon={<FormatListNumberedOutlinedIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />
              )}

            <Typography
              variant="h6"
              color={colors.grey[300]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              Data
            </Typography>

            {canView('General Information') && (
              <Item
                title="General Information"
                to={getGeneralInfoRoute()} // Use the dynamic route function here
                icon={<PeopleOutlinedIcon />}
                selected={selected}
                setSelected={setSelected}
              />
            )}
            
          {canView('Referrals') && (
            <Item
              title="Referrals"
              to="/referralinfo"
              icon={<AssignmentIndOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            )}


            {canView('Clinical Inventory') && (
              <Item
              title="Clinical Inventory"
              to="/inventory"
              icon={<InventoryIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            )}

            <Typography
              variant="h6"
              color={colors.grey[300]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              Pages
            </Typography>
            
            <Item
              title="Calendar"
              to="/calendar"
              icon={<CalendarTodayOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />

            {/* <Typography
              variant="h6"
              color={colors.grey[300]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              Charts
            </Typography>
            <Item
              title="Bar Chart"
              to="/bar"
              icon={<BarChartOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Pie Chart"
              to="/pie"
              icon={<PieChartOutlineOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Line Chart"
              to="/line"
              icon={<TimelineOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            /> */}

            <Menu iconShape="square">
              <MenuItem
                icon={<LogoutIcon />}
                onClick={handleLogout}
                style={{
                  position: 'absolute', 
                  bottom: 0,
                  width: '100%', 
                }}
              >
                Logout
              </MenuItem>
            </Menu>
            
          </Box>
        </Menu>
      </ProSidebar>
    </Box>
  );
};

export default Sidebar;
