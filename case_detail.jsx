import React, { useState, useEffect } from "react";
import { Box, Tabs, Tab, Typography, useTheme, Paper } from "@mui/material";
import { tokens } from "../theme";
import Header from "../components/Header";
import { useParams, useLocation } from "react-router-dom";
import { DataGrid } from "@mui/x-data-grid";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase.config";
import {
  mockDataCases,
  mockDataTeam,
  mockDataXrayTests,
} from "../data/mockData";

const Case_Detail = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const caseId = useParams();
  const [casesData, setCasesData] = useState([]);
  const [caseData, setCaseData] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [currentCaseTab, setCurrentCaseTab] = useState(0);
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };
  const handleCaseTabChange = (event, newValue) => {
    setCurrentCaseTab(newValue);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "cases"));
        let data = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));

        // Find data based on the Case Number
        const caseData = data.find(
          (caseData) => caseData.id === caseId.caseNumber
        );

        //Assume timestamp is an object
        const startDate = caseData.startDate.toDate();
        const endDate = caseData.endDate.toDate();

        // Format Start and End Date timestamps
        const formattedStartDate = startDate.toLocaleDateString();
        const formattedEndDate = endDate.toLocaleDateString();

        // Set start and End Date
        setStartDate(formattedStartDate);
        setEndDate(formattedEndDate);

        //Set Case Data
        setCaseData(caseData);
      } catch (error) {
        console.error("Error fetching patient data: ", error);
      }
    };

    // Only fetch data if caseId exists
    if (caseId) {
      fetchData();
    }
  }, [caseId]); // Dependency should be caseId, not casesData

  // Conditionally render the component based on data availability
  if (!caseData) {
    return (
      <div>
        <Box m="20px">
          <Header
            title="Patient Information"
            subtitle="Managing patient data"
          />
        </Box>
      </div>
    ); // or any other loading indicator
  }

  const columns = [
    {
      field: "location",
      headerName: "Test Location",
      headerAlign: "left",
      flex: 1,
    },
    {
      field: "testDate",
      headerName: "Date Tested",
      type: "date",
      headerAlign: "left",
      align: "left",
    },
    {
      field: "referenceNumber",
      headerName: "Reference #",
      headerAlign: "left",
      align: "left",
    },
    {
      field: "result",
      headerName: "Result",
      flex: 1,
    },
    {
      field: "validity",
      headerName: "Validity",
      flex: 1,
    },
  ];

  return (
    <Box m="20px">
      <Header title="Patient Information" subtitle="Managing patient data" />
      <div>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          indicatorColor="secondary"
          textColor="inherit"
          fixed
        >
          <Tab label="Laboratory Test" />
          <Tab label="Diagnosis" />
          <Tab label="Close Contracts" />
          <Tab label="Assessment" />
          <Tab label="Treatments" />
          <Tab label="Similar Cases" />
        </Tabs>
        {currentTab === 0 ? (
          <Box
            component={Paper}
            gridColumn="span 8"
            gridRow="span 2"
            backgroundColor={colors.primary[400]}
            borderRadius="4px"
          >
            <Box mt="25px" p="30px">
              <Box>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <Box
                        p="10px"
                        mb="5px"
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        backgroundColor={colors.primary[600]}
                        borderRadius="4px"
                      >
                        <Typography
                          variant="h5"
                          fontWeight="bold"
                          color={colors.grey[100]}
                        >
                          Case Reference Number:
                        </Typography>
                      </Box>
                      <Box
                        p="10px"
                        mb="5px"
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        backgroundColor={colors.primary[600]}
                        borderRadius="4px"
                      >
                        <Typography
                          variant="h5"
                          fontWeight="bold"
                          color={colors.grey[100]}
                        >
                          Patient Name:
                        </Typography>
                      </Box>
                      <Box
                        p="10px"
                        mb="5px"
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        backgroundColor={colors.primary[600]}
                        borderRadius="4px"
                      >
                        <Typography
                          variant="h5"
                          fontWeight="bold"
                          color={colors.grey[100]}
                        >
                          Case Status:
                        </Typography>
                      </Box>
                    </div>
                    <div style={{ marginLeft: "10px" }}>
                      <Box
                        p="10px"
                        mb="5px"
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        backgroundColor={colors.primary[600]}
                        borderRadius="4px"
                      >
                        <Typography
                          variant="h5"
                          fontWeight="600"
                          color={colors.greenAccent[500]}
                        >
                          {caseData.caseNumber}
                        </Typography>
                      </Box>
                      <Box
                        p="10px"
                        mb="5px"
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        backgroundColor={colors.primary[600]}
                        borderRadius="4px"
                      >
                        <Typography
                          variant="h5"
                          fontWeight="600"
                          color={colors.greenAccent[500]}
                        >
                          {caseData.fullName}
                        </Typography>
                      </Box>
                      <Box
                        p="10px"
                        mb="5px"
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        backgroundColor={colors.primary[600]}
                        borderRadius="4px"
                      >
                        <Typography
                          variant="h5"
                          fontWeight="600"
                          color={colors.greenAccent[500]}
                        >
                          {caseData.caseStatus}
                        </Typography>
                      </Box>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <Box
                        p="10px"
                        mb="5px"
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        backgroundColor={colors.primary[600]}
                        borderRadius="4px"
                      >
                        <Typography
                          variant="h5"
                          fontWeight="bold"
                          color={colors.grey[100]}
                        >
                          Start Date:
                        </Typography>
                      </Box>
                      <Box
                        p="10px"
                        mb="5px"
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        backgroundColor={colors.primary[600]}
                        borderRadius="4px"
                      >
                        <Typography
                          variant="h5"
                          fontWeight="bold"
                          color={colors.grey[100]}
                        >
                          End Date:
                        </Typography>
                      </Box>
                    </div>
                    <div style={{ marginLeft: "10px" }}>
                      <Box
                        p="10px"
                        mb="5px"
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        backgroundColor={colors.primary[600]}
                        borderRadius="4px"
                      >
                        <Typography
                          variant="h5"
                          fontWeight="600"
                          color={colors.greenAccent[500]}
                        >
                          {startDate}
                        </Typography>
                      </Box>
                      <Box
                        p="10px"
                        mb="5px"
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        backgroundColor={colors.primary[600]}
                        borderRadius="4px"
                      >
                        <Typography
                          variant="h5"
                          fontWeight="600"
                          color={colors.greenAccent[500]}
                        >
                          {endDate}
                        </Typography>
                      </Box>
                    </div>
                  </div>
                </div>
                <Tabs
                  value={currentCaseTab}
                  onChange={handleCaseTabChange}
                  indicatorColor="secondary"
                  textColor="inherit"
                  centered
                >
                  <Tab label="XRay Tests" />
                  <Tab label="MTB/RIF Tests" />
                  <Tab label="TST Tests" />
                  <Tab label="IGRA Tests" />
                </Tabs>
                {currentCaseTab === 0 ? (
                  <div>
                    <Box
                      m="10px 0 0 0"
                      height="auto"
                      sx={{
                        "& .MuiDataGrid-root": {
                          border: "none",
                        },
                        "& .MuiDataGrid-cell": {
                          borderBottom: "none",
                        },
                        "& .name-column--cell": {
                          color: colors.greenAccent[300],
                        },
                        "& .MuiDataGrid-columnHeaders": {
                          backgroundColor: colors.blueAccent[700],
                          borderBottom: "none",
                        },
                        "& .MuiDataGrid-virtualScroller": {
                          backgroundColor: colors.primary[400],
                        },
                        "& .MuiDataGrid-footerContainer": {
                          borderTop: "none",
                          backgroundColor: colors.blueAccent[700],
                        },
                        "& .MuiCheckbox-root": {
                          color: `${colors.greenAccent[200]} !important`,
                        },
                      }}
                    >
                      <DataGrid rows={mockDataXrayTests} columns={columns} />
                    </Box>
                  </div>
                ) : (
                  currentCaseTab === 1 && (
                    <div>
                      <Typography variant="h6">MTB/RIF Tests</Typography>
                    </div>
                  )
                )}
              </Box>
            </Box>
          </Box>
        ) : (
          currentTab === 1 && (
            <div>
              <Typography variant="h6">Patient Profile</Typography>
            </div>
          )
        )}
      </div>
    </Box>
  );
};

export default Case_Detail;
