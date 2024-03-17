import React, { useState, useContext } from 'react';
import { Badge, Box, IconButton, useTheme} from "@mui/material";

import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import AlertIcon from '@mui/icons-material/NotificationImportant';
import Header from "../../components/Header";
import Alerts from './Alerts';
import { ColorModeContext } from "../../theme";

const Topbar = () => {
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);

  
  const handleAlertsClick = () => setAlertDialogOpen(true);
  const handleAlertsClose = () => setAlertDialogOpen(false);

  return (
    <Box display="flex" justifyContent="space-between" p={2} sx={{ backgroundColor: theme.palette.background.paper }}>
      <Header title="PEDTB-CI" />

      <Box display="flex">
        <IconButton onClick={colorMode.toggleColorMode}>
          {theme.palette.mode === 'dark' ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
        </IconButton>

        <IconButton onClick={handleAlertsClick}>
          <Badge color="secondary">
            <AlertIcon />
          </Badge>
        </IconButton>

        <IconButton><SettingsOutlinedIcon /></IconButton>
        <IconButton><PersonOutlinedIcon /></IconButton>
      </Box>

      {/* Alerts dialog */}
      <Alerts alertDialogOpen={alertDialogOpen} handleAlertsClose={handleAlertsClose} />
    </Box>
  );
};

export default Topbar;
