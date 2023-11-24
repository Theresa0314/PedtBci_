import {useState} from 'react';
import { useLocation } from "react-router-dom";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import Sidebar from "./pages/global/Sidebar";
import Topbar from "./pages/global/Topbar";
import { PatientInfoProvider } from './PatientInfoContext';

import { Outlet } from 'react-router-dom';

function App() {
  const [theme, colorMode] = useMode();
  const [isSidebar, setIsSidebar] = useState(true);
  const location = useLocation();

  // Function to check if the current location matches certain paths
    const shouldShowSidebar = () => {
    const { pathname } = location;
    return !['/form', '/login', '/signup'].includes(pathname);
  };

  return (
<PatientInfoProvider> {/* Wrap your application with PatientInfoProvider */}
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <div className="app">
            {shouldShowSidebar() && <Sidebar isSidebar={isSidebar} />}
            <main className="content">
              <Topbar setIsSidebar={setIsSidebar} />
              <Outlet />
            </main>
          </div>
        </ThemeProvider>
      </ColorModeContext.Provider>
    </PatientInfoProvider> /* Close the PatientInfoProvider */
  );
}

export default App;
