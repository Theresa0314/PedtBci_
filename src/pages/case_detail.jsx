import React, { useState, useEffect } from "react";
import {
  Box,
  Tabs,
  Tab,
  Typography,
  useTheme,
  Paper,
  Button,
  Modal,
} from "@mui/material";
import { tokens } from "../theme";
import Header from "../components/Header";
import { useParams } from "react-router-dom";
import { DataGrid } from "@mui/x-data-grid";
import { collection, getDocs } from "firebase/firestore";
import { db, doc, deleteDoc } from "../firebase.config";
import { mockDataXrayTests } from "../data/mockData";
import XrayGenForm from "./xraygenform";
import MTBRIFGenForm from "./mtbrifgenform";
import TSTGenForm from "./tstgenform";
import IGRAGenForm from "./igragenform";
import DSTGenForm from "./dstgenform";
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'

const Case_Detail = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const caseId = useParams();
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

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "100%", // Use a percentage to make it responsive
    maxWidth: 1000, // You can also set a maxWidth
    bgcolor: "background.paper",
    boxShadow: 20,
    p: 4,
    borderRadius: 2, // Optional: if you want rounded corners
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "xray"));
        let data = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        // Sort by dateAdded in ascending order
        data.sort((a, b) => {
          const dateA = new Date(a.dateAdded);
          const dateB = new Date(b.dateAdded);
          return dateA - dateB;
        });
        setXrayData(data);
      } catch (error) {
        console.error("Error fetching patient data: ", error);
      }
    };
    
    fetchData();
  }, []);

  const [open, setOpen] = useState(false);

  const handleOpenForm = () => {
    setOpen(true);
  };

  const handleCloseForm = () => {
    setOpen(false);
  };

  const [xrayData, setXrayData] = useState([]);

  // Handle creation of new cases
  const handleAddNewXray = (newXray) => {
    setXrayData((currentXray) => {
      const updatedXrays = [...currentXray, newXray];
      updatedXrays.sort((a, b) => {
        const dateA = new Date(a.dateAdded);
        const dateB = new Date(b.dateAdded);
        return dateA - dateB; // Ascending order
      });
      return updatedXrays;
    });
  };

  // Delete Dialogs
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const handleClickDelete = (id) => {
    // Set the id to be deleted and open the dialog
    setDeleteId(id);
    setOpenDeleteDialog(true);
  };
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  const handleDelete = async () => {
    handleCloseDeleteDialog();
    // if (deleteId) {
    //   try {
    //     await deleteDoc(doc(db, "patientsinfo", deleteId));
    //     setPatientsData(patientsData.filter((item) => item.id !== deleteId));
    //   } catch (error) {
    //     console.error("Error deleting patient: ", error);
    //   }
    // }
  };
  
  
  const handleEdit = (id) => {
    // Navigate to the edit page or open an edit modal
    // navigate(`/patientedit/${id}`);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch x-ray data
        const queryXraySnapshot = await getDocs(collection(db, "xray"));
        let dataXray = queryXraySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        // Sort by dateAdded in ascending order
        dataXray.sort((a, b) => {
          const dateA = new Date(a.dateAdded);
          const dateB = new Date(b.dateAdded);
          return dateA - dateB;
        });
        setXrayData(dataXray);

        // Fetch case data
        const querySnapshot = await getDocs(collection(db, "cases"));
        let data = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));

        // Find data based on the Case Number
        const caseData = data.find(
          (caseData) => caseData.id === caseId.caseNumber
        );

        // Assume timestamp is an object
        const startDate = caseData.startDate.toDate();
        const endDate = caseData.endDate.toDate();

        // Format Start and End Date timestamps
        const formattedStartDate = startDate.toLocaleDateString();
        const formattedEndDate = endDate.toLocaleDateString();

        // Set start and End Date
        setStartDate(formattedStartDate);
        setEndDate(formattedEndDate);

        // Set Case Data
        setCaseData(caseData);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    // Only fetch data if caseId exists
    if (caseId) {
      fetchData();
    }
  }, [caseId]);
 // Dependency should be caseId, not casesData

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
      field: "referenceNumber",
      headerName: "Reference #",
      headerAlign: "left",
      align: "left",
      width: 120,
    },
    {
      field: "testLocation",
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
      // Add a custom formatter if necessary to format the date
      valueFormatter: (params) => {
        const valueFormatted = new Date(params.value).toLocaleDateString('en-US', { timeZone: 'Asia/Manila' });
        return valueFormatted;
      },
    },
    {
      field: "testResult",
      headerName: "Result",
      flex: 1,
    },
    {
      field: "validity",
      headerName: "Validity",
      flex: 1,
    },
    {
      field: 'action',
      headerName: 'Action',
      sortable: false,
      renderCell: (params) => (
        <Box display="flex" justifyContent="center">
          <Button
            startIcon={<EditIcon />}
            onClick={() => handleEdit(params.id)}
            variant="contained"
            color="secondary"
            style={{ marginRight: 8 }}
          >
            Edit
          </Button>
          <Button
            startIcon={<DeleteIcon />}
            onClick={() => handleClickDelete(params.id)}
            variant="contained"
            color="error"
          >
            Delete
          </Button>
        </Box>
      ),
      width: 200
    }, 
  ];

  const dstColumns = [
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
      field: "isoniazid",
      headerName: "Isoniazid",
      flex: 1,
    },
    {
      field: "ethionamide",
      headerName: "Ethionamide",
      flex: 1,
    },
    {
      field: "fluoroquinolones",
      headerName: "Fluoroquinolones",
      flex: 1,
    },
    {
      field: "amikacin",
      headerName: "Amikacin",
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
                  <Tab label="DST Tests" />
                </Tabs>

                {/* Different tabs for Xray, MTB/RIF, TST, IGRA */}
                {currentCaseTab === 0 ? (
                  <div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography
                        variant="h4"
                        fontWeight="bold"
                        color={colors.grey[100]}
                      >
                        Xray Tests
                      </Typography>
                      <div style={{ marginLeft: "auto" }}>
                        <Button
                          variant="contained"
                          onClick={handleOpenForm}
                          style={{
                            backgroundColor: colors.greenAccent[600],
                            color: colors.grey[100],
                            height: "40px",
                            marginTop: theme.spacing(1),
                          }}
                        >
                          Add New Xray
                        </Button>
                      </div>
                      {/* Modal for the PatientGenForm */}
                      <Modal
                        open={open}
                        onClose={handleCloseForm}
                        aria-labelledby="modal-modal-title"
                        aria-describedby="modal-modal-description"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <XrayGenForm
                          handleCloseForm={handleCloseForm}
                          handleUpdatePatients={handleAddNewXray}
                          caseNumber={caseData.caseNumber}
                        />
                      </Modal>
                    </div>
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
                      <DataGrid rows={xrayData} columns={columns} />
                    </Box>
                  </div>
                ) : (
                  currentCaseTab === 1 && (
                    <div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Typography
                          variant="h4"
                          fontWeight="bold"
                          color={colors.grey[100]}
                        >
                          MTB/RIF Tests
                        </Typography>
                        <div style={{ marginLeft: "auto" }}>
                          <Button
                            variant="contained"
                            onClick={handleOpenForm}
                            style={{
                              backgroundColor: colors.greenAccent[600],
                              color: colors.grey[100],
                              height: "40px",
                              marginTop: theme.spacing(1),
                            }}
                          >
                            Add New MTB/RIF
                          </Button>
                        </div>
                        {/* Modal for the PatientGenForm */}
                        <Modal
                          open={open}
                          onClose={handleCloseForm}
                          aria-labelledby="modal-modal-title"
                          aria-describedby="modal-modal-description"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <MTBRIFGenForm
                            handleCloseForm={handleCloseForm}
                            handleUpdatePatients={handleAddNewXray}
                          />
                        </Modal>
                      </div>
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
                  )
                )}
                {currentCaseTab === 2 ? (
                  <div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography
                        variant="h4"
                        fontWeight="bold"
                        color={colors.grey[100]}
                      >
                        TST Tests
                      </Typography>
                      <div style={{ marginLeft: "auto" }}>
                        <Button
                          variant="contained"
                          onClick={handleOpenForm}
                          style={{
                            backgroundColor: colors.greenAccent[600],
                            color: colors.grey[100],
                            height: "40px",
                            marginTop: theme.spacing(1),
                          }}
                        >
                          Add New TST
                        </Button>
                      </div>
                      {/* Modal for the PatientGenForm */}
                      <Modal
                        open={open}
                        onClose={handleCloseForm}
                        aria-labelledby="modal-modal-title"
                        aria-describedby="modal-modal-description"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <TSTGenForm
                          handleCloseForm={handleCloseForm}
                          handleUpdatePatients={handleAddNewXray}
                        />
                      </Modal>
                    </div>
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
                  currentCaseTab === 3 && (
                    <div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Typography
                          variant="h4"
                          fontWeight="bold"
                          color={colors.grey[100]}
                        >
                          IGRA Tests
                        </Typography>
                        <div style={{ marginLeft: "auto" }}>
                          <Button
                            variant="contained"
                            onClick={handleOpenForm}
                            style={{
                              backgroundColor: colors.greenAccent[600],
                              color: colors.grey[100],
                              height: "40px",
                              marginTop: theme.spacing(1),
                            }}
                          >
                            Add New IGRA
                          </Button>
                        </div>
                        {/* Modal for the PatientGenForm */}
                        <Modal
                          open={open}
                          onClose={handleCloseForm}
                          aria-labelledby="modal-modal-title"
                          aria-describedby="modal-modal-description"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <IGRAGenForm
                            handleCloseForm={handleCloseForm}
                            handleUpdatePatients={handleAddNewXray}
                          />
                        </Modal>
                      </div>
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
                  )
                )}
                {currentCaseTab === 4 && (
                  <div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography
                        variant="h4"
                        fontWeight="bold"
                        color={colors.grey[100]}
                      >
                        DST Tests
                      </Typography>
                      <div style={{ marginLeft: "auto" }}>
                        <Button
                          variant="contained"
                          onClick={handleOpenForm}
                          style={{
                            backgroundColor: colors.greenAccent[600],
                            color: colors.grey[100],
                            height: "40px",
                            marginTop: theme.spacing(1),
                          }}
                        >
                          Add New DST
                        </Button>
                      </div>
                      {/* Modal for the PatientGenForm */}
                      <Modal
                        open={open}
                        onClose={handleCloseForm}
                        aria-labelledby="modal-modal-title"
                        aria-describedby="modal-modal-description"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <div
                          style={{
                            maxHeight: "90vh",
                            overflow: "auto",
                            marginTop: "10px",
                            marginBottom: "10px",
                          }}
                        >
                          <DSTGenForm
                            handleCloseForm={handleCloseForm}
                            handleUpdatePatients={handleAddNewXray}
                          />
                        </div>
                      </Modal>
                    </div>
                    {/*  */}

                    {/* Place DST Data Grid here */}
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
                      <DataGrid rows={mockDataXrayTests} columns={dstColumns} />
                    </Box>

                    {/*  */}
                  </div>
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
