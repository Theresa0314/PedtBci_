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
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { tokens } from "../theme";
import Header from "../components/Header";
import { useParams } from "react-router-dom";
import { DataGrid } from "@mui/x-data-grid";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase.config";
import XrayGenForm from "./xraygenform";
import MTBRIFGenForm from "./mtbrifgenform";
import TSTGenForm from "./tstgenform";
import IGRAGenForm from "./igragenform";
import DSTGenForm from "./dstgenform";
import EditXrayGenForm from "./editxraygenform";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import DiagnosisDetail from "./diagnosisdetail";

const Case_Detail = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const caseId = useParams();
  const [caseData, setCaseData] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [currentCaseTab, setCurrentCaseTab] = useState(0);
  const [diagnosisModalData, setDiagnosisModalData] = useState(null);
  const [xrayEditModalData, setXrayEditModalData] = useState(null);
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
        let data = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
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
  const [mtbrifData, setMTBRIFData] = useState([]);
  const [tstData, setTSTData] = useState([]);
  const [igraData, setIGRAData] = useState([]);
  const [dstData, setDSTData] = useState([]);
  const [diagnosisData, setDiagnosisData] = useState([]);

  // Handle creation of new tests
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

  const handleAddNewMTBRIF = (newMTBRIF) => {
    setMTBRIFData((currentMTBRIF) => {
      const updatedMTBRIF = [...currentMTBRIF, newMTBRIF];
      updatedMTBRIF.sort((a, b) => {
        const dateA = new Date(a.dateAdded);
        const dateB = new Date(b.dateAdded);
        return dateA - dateB; // Ascending order
      });
      return updatedMTBRIF;
    });
  };

  const handleAddNewTST = (newTST) => {
    setTSTData((currentTST) => {
      const updatedTST = [...currentTST, newTST];
      updatedTST.sort((a, b) => {
        const dateA = new Date(a.dateAdded);
        const dateB = new Date(b.dateAdded);
        return dateA - dateB; // Ascending order
      });
      return updatedTST;
    });
  };

  const handleAddNewIGRA = (newIGRA) => {
    setIGRAData((currentIGRA) => {
      const updatedIGRA = [...currentIGRA, newIGRA];
      updatedIGRA.sort((a, b) => {
        const dateA = new Date(a.dateAdded);
        const dateB = new Date(b.dateAdded);
        return dateA - dateB; // Ascending order
      });
      return updatedIGRA;
    });
  };

  const handleAddNewDST = (newDST) => {
    setDSTData((currentDST) => {
      const updatedDST = [...currentDST, newDST];
      updatedDST.sort((a, b) => {
        const dateA = new Date(a.dateAdded);
        const dateB = new Date(b.dateAdded);
        return dateA - dateB; // Ascending order
      });
      return updatedDST;
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

  const handleXrayDelete = async () => {
    handleCloseDeleteDialog();
    if (deleteId) {
      try {
        await deleteDoc(doc(db, "xray", deleteId));
        setCaseData(caseData.filter((item) => item.id !== deleteId));
      } catch (error) {
        console.error("Error deleting test: ", error);
      }
    }
  };

  const handleMTBRIFDelete = async () => {
    handleCloseDeleteDialog();
    if (deleteId) {
      try {
        await deleteDoc(doc(db, "mtbrif", deleteId));
        setCaseData(caseData.filter((item) => item.id !== deleteId));
      } catch (error) {
        console.error("Error deleting test: ", error);
      }
    }
  };

  const handleTSTDelete = async () => {
    handleCloseDeleteDialog();
    if (deleteId) {
      try {
        await deleteDoc(doc(db, "tst", deleteId));
        setCaseData(caseData.filter((item) => item.id !== deleteId));
      } catch (error) {
        console.error("Error deleting test: ", error);
      }
    }
  };

  const handleIGRADelete = async () => {
    handleCloseDeleteDialog();
    if (deleteId) {
      try {
        await deleteDoc(doc(db, "igra", deleteId));
        setCaseData(caseData.filter((item) => item.id !== deleteId));
      } catch (error) {
        console.error("Error deleting case: ", error);
      }
    }
  };

  const handleDSTDelete = async () => {
    handleCloseDeleteDialog();
    if (deleteId) {
      try {
        await deleteDoc(doc(db, "dst", deleteId));
        setCaseData(caseData.filter((item) => item.id !== deleteId));
      } catch (error) {
        console.error("Error deleting case: ", error);
      }
    }
  };

  const handleEdit = (id) => {
    // Navigate to the edit page or open an edit modal
    // navigate(`/patientedit/${id}`);
    const selectedEditData = xrayData.find(
      (xray) => xray.id === id
    );
    console.log(selectedEditData);
    // Pass the selected diagnosis data to the modal
    setXrayEditModalData(selectedEditData);

    //Open the Modal
    setOpen(true);
  };

  const handleViewDiagnosis = (id) => {
    // Find the specific diagnosis data based on the id
    const selectedDiagnosis = diagnosisData.find(
      (diagnosis) => diagnosis.id === id
    );
    console.log(selectedDiagnosis);
    // Pass the selected diagnosis data to the modal
    setDiagnosisModalData(selectedDiagnosis);

    //Open the Modal
    setOpen(true);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch x-ray data
        const queryXraySnapshot = await getDocs(collection(db, "xray"));
        let dataXray = queryXraySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        // Sort by dateAdded in ascending order
        dataXray.sort((a, b) => {
          const dateA = new Date(a.dateAdded);
          const dateB = new Date(b.dateAdded);
          return dateA - dateB;
        });
        setXrayData(dataXray);

        // Fetch mtb/rif data
        const queryMTBRIFSnapshot = await getDocs(collection(db, "mtbrif"));
        let dataMTBRIF = queryMTBRIFSnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        // Sort by dateAdded in ascending order
        dataMTBRIF.sort((a, b) => {
          const dateA = new Date(a.dateAdded);
          const dateB = new Date(b.dateAdded);
          return dateA - dateB;
        });
        setMTBRIFData(dataMTBRIF);

        // Fetch tst data
        const queryTSTSnapshot = await getDocs(collection(db, "tst"));
        let dataTST = queryTSTSnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        // Sort by dateAdded in ascending order
        dataTST.sort((a, b) => {
          const dateA = new Date(a.dateAdded);
          const dateB = new Date(b.dateAdded);
          return dateA - dateB;
        });
        setTSTData(dataTST);

        // Fetch igra data
        const queryIGRASnapshot = await getDocs(collection(db, "igra"));
        let dataIGRA = queryIGRASnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        // Sort by dateAdded in ascending order
        dataIGRA.sort((a, b) => {
          const dateA = new Date(a.dateAdded);
          const dateB = new Date(b.dateAdded);
          return dateA - dateB;
        });
        setIGRAData(dataIGRA);

        // Fetch dst data
        const queryDSTSnapshot = await getDocs(collection(db, "dst"));
        let dataDST = queryDSTSnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        // Sort by dateAdded in ascending order
        dataDST.sort((a, b) => {
          const dateA = new Date(a.dateAdded);
          const dateB = new Date(b.dateAdded);
          return dateA - dateB;
        });
        setDSTData(dataDST);

        // Fetch diagnosis data
        const queryDiagnosisSnapshot = await getDocs(
          collection(db, "diagnosis")
        );
        let dataDiagnosis = queryDiagnosisSnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        // Sort by dateAdded in ascending order
        dataDiagnosis.sort((a, b) => {
          const dateA = new Date(a.dateAdded);
          const dateB = new Date(b.dateAdded);
          return dateA - dateB;
        });
        setDiagnosisData(dataDiagnosis);

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
  }, [caseId, caseData, xrayData, mtbrifData, tstData, igraData, dstData]);
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
      headerAlign: "center",
      align: "center",
      width: 120,
    },
    {
      field: "testLocation",
      headerName: "Test Location",
      headerAlign: "center",
      align: "center",
      flex: 1,
    },
    {
      field: "testDate",
      headerName: "Date Tested",
      type: "date",
      headerAlign: "center",
      align: "center",
      // Add a custom formatter if necessary to format the date
      valueFormatter: (params) => {
        const valueFormatted = new Date(params.value).toLocaleDateString(
          "en-US",
          { timeZone: "Asia/Manila" }
        );
        return valueFormatted;
      },
    },
    {
      field: "testResult",
      headerName: "Result",
      headerAlign: "center",
      align: "center",
      flex: 1,
    },
    {
      field: "validity",
      headerName: "Validity",
      headerAlign: "center",
      align: "center",
      flex: 1,
    },
    {
      field: "action",
      headerName: "Action",
      sortable: false,
      headerAlign: "center",
      align: "center",
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
      width: 200,
    },
  ];

  const diagnosisColumns = [
    {
      field: "referenceNumber",
      headerName: "Case Number",
      headerAlign: "center",
      align: "center",
      width: 120,
    },
    {
      field: "testDate",
      headerName: "Date Diagnosed",
      type: "date",
      headerAlign: "center",
      align: "center",
      // Add a custom formatter if necessary to format the date
      valueFormatter: (params) => {
        const valueFormatted = new Date(params.value).toLocaleDateString(
          "en-US",
          { timeZone: "Asia/Manila" }
        );
        return valueFormatted;
      },
    },
    {
      field: "testResult",
      headerName: "Diagnosis",
      headerAlign: "center",
      align: "center",
      flex: 1,
    },
    {
      field: "status",
      headerName: "Status",
      headerAlign: "center",
      align: "center",
      flex: 1,
    },
    {
      field: "action",
      headerName: "Action",
      sortable: false,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <Box display="flex" justifyContent="center">
          <Button
            startIcon={<EditIcon />}
            onClick={() => {
              handleViewDiagnosis(params.id);
            }}
            variant="contained"
            color="secondary"
            style={{ marginRight: 8 }}
          >
            View Diagnosis
          </Button>
        </Box>
      ),
      width: 200,
    },
  ];

  const dstColumns = [
    {
      field: "referenceNumber",
      headerName: "Reference #",
      headerAlign: "center",
      align: "left",
      width: 120,
    },
    {
      field: "testLocation",
      headerName: "Test Location",
      headerAlign: "center",
      flex: 1,
    },
    {
      field: "testDate",
      headerName: "Date Tested",
      type: "date",
      headerAlign: "center",
      align: "left",
      // Add a custom formatter if necessary to format the date
      valueFormatter: (params) => {
        const valueFormatted = new Date(params.value).toLocaleDateString(
          "en-US",
          { timeZone: "Asia/Manila" }
        );
        return valueFormatted;
      },
    },
    {
      field: "isoniazid",
      headerName: "Isoniazid",
      headerAlign: "center",
      flex: 1,
    },
    {
      field: "ethionamide",
      headerName: "Ethionamide",
      headerAlign: "center",
      flex: 1,
    },
    {
      field: "fluoroquinolones",
      headerName: "Fluoroquinolones",
      headerAlign: "center",
      flex: 1,
    },
    {
      field: "amikacin",
      headerName: "Amikacin",
      headerAlign: "center",
      flex: 1,
    },
    {
      field: "validity",
      headerName: "Validity",
      headerAlign: "center",
      flex: 1,
    },
    {
      field: "action",
      headerName: "Action",
      sortable: false,
      headerAlign: "center",
      align: "center",
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
      width: 200,
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
          <Tab label="Close Contacts" />
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
                <Divider
                  variant="fullWidth"
                  style={{
                    backgroundColor: colors.greenAccent[600],
                    color: colors.grey[100],
                    height: "2px",
                    marginTop: theme.spacing(3),
                  }}
                />
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
                        variant="h3"
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
                      {/* Modal for the XrayGenForm */}
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
                          handleUpdateXrays={handleAddNewXray}
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

                    {/* Modal for the XrayGenForm
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
                        <EditXrayGenForm
                          handleCloseForm={handleCloseForm}
                          caseNumber={caseData.caseNumber}
                          xrayDataToEdit={xrayEditModalData}
                        />
                      </Modal> */}
                    
                    {/* Delete Confirmation Dialog */}
                    <Dialog
                      open={openDeleteDialog}
                      onClose={handleCloseDeleteDialog}
                      aria-labelledby="alert-dialog-title"
                      aria-describedby="alert-dialog-description"
                    >
                      <DialogTitle
                        id="alert-dialog-title"
                        style={{
                          color: colors.greenAccent[600],
                          fontSize: "1.5rem",
                        }}
                      >
                        Confirm Deletion
                      </DialogTitle>
                      <DialogContent>
                        <DialogContentText
                          id="alert-dialog-description"
                          style={{ color: colors.grey[100] }}
                        >
                          Are you sure you want to delete this test? This action
                          cannot be undone.
                        </DialogContentText>
                      </DialogContent>
                      <DialogActions
                        style={{
                          justifyContent: "center",
                          padding: theme.spacing(3),
                        }}
                      >
                        <Button
                          onClick={handleCloseDeleteDialog}
                          style={{
                            color: colors.grey[100],
                            borderColor: colors.greenAccent[500],
                            marginRight: theme.spacing(1),
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleXrayDelete}
                          style={{
                            backgroundColor: colors.greenAccent[600],
                            color: colors.grey[100],
                          }}
                          autoFocus
                        >
                          Delete
                        </Button>
                      </DialogActions>
                    </Dialog>
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
                          variant="h3"
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
                            handleUpdateMTBRIF={handleAddNewMTBRIF}
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
                        <DataGrid rows={mtbrifData} columns={columns} />
                      </Box>
                      {/* Delete Confirmation Dialog */}
                      <Dialog
                        open={openDeleteDialog}
                        onClose={handleCloseDeleteDialog}
                        aria-labelledby="alert-dialog-title"
                        aria-describedby="alert-dialog-description"
                      >
                        <DialogTitle
                          id="alert-dialog-title"
                          style={{
                            color: colors.greenAccent[600],
                            fontSize: "1.5rem",
                          }}
                        >
                          Confirm Deletion
                        </DialogTitle>
                        <DialogContent>
                          <DialogContentText
                            id="alert-dialog-description"
                            style={{ color: colors.grey[100] }}
                          >
                            Are you sure you want to delete this test? This
                            action cannot be undone.
                          </DialogContentText>
                        </DialogContent>
                        <DialogActions
                          style={{
                            justifyContent: "center",
                            padding: theme.spacing(3),
                          }}
                        >
                          <Button
                            onClick={handleCloseDeleteDialog}
                            style={{
                              color: colors.grey[100],
                              borderColor: colors.greenAccent[500],
                              marginRight: theme.spacing(1),
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleMTBRIFDelete}
                            style={{
                              backgroundColor: colors.greenAccent[600],
                              color: colors.grey[100],
                            }}
                            autoFocus
                          >
                            Delete
                          </Button>
                        </DialogActions>
                      </Dialog>
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
                        variant="h3"
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
                          handleUpdateTST={handleAddNewTST}
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
                      <DataGrid rows={tstData} columns={columns} />
                    </Box>
                    {/* Delete Confirmation Dialog */}
                    <Dialog
                        open={openDeleteDialog}
                        onClose={handleCloseDeleteDialog}
                        aria-labelledby="alert-dialog-title"
                        aria-describedby="alert-dialog-description"
                      >
                        <DialogTitle
                          id="alert-dialog-title"
                          style={{
                            color: colors.greenAccent[600],
                            fontSize: "1.5rem",
                          }}
                        >
                          Confirm Deletion
                        </DialogTitle>
                        <DialogContent>
                          <DialogContentText
                            id="alert-dialog-description"
                            style={{ color: colors.grey[100] }}
                          >
                            Are you sure you want to delete this test? This
                            action cannot be undone.
                          </DialogContentText>
                        </DialogContent>
                        <DialogActions
                          style={{
                            justifyContent: "center",
                            padding: theme.spacing(3),
                          }}
                        >
                          <Button
                            onClick={handleCloseDeleteDialog}
                            style={{
                              color: colors.grey[100],
                              borderColor: colors.greenAccent[500],
                              marginRight: theme.spacing(1),
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleTSTDelete}
                            style={{
                              backgroundColor: colors.greenAccent[600],
                              color: colors.grey[100],
                            }}
                            autoFocus
                          >
                            Delete
                          </Button>
                        </DialogActions>
                      </Dialog>
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
                          variant="h3"
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
                            handleUpdateIGRA={handleAddNewIGRA}
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
                        <DataGrid rows={igraData} columns={columns} />
                      </Box>
                      {/* Delete Confirmation Dialog */}
                      <Dialog
                        open={openDeleteDialog}
                        onClose={handleCloseDeleteDialog}
                        aria-labelledby="alert-dialog-title"
                        aria-describedby="alert-dialog-description"
                      >
                        <DialogTitle
                          id="alert-dialog-title"
                          style={{
                            color: colors.greenAccent[600],
                            fontSize: "1.5rem",
                          }}
                        >
                          Confirm Deletion
                        </DialogTitle>
                        <DialogContent>
                          <DialogContentText
                            id="alert-dialog-description"
                            style={{ color: colors.grey[100] }}
                          >
                            Are you sure you want to delete this test? This
                            action cannot be undone.
                          </DialogContentText>
                        </DialogContent>
                        <DialogActions
                          style={{
                            justifyContent: "center",
                            padding: theme.spacing(3),
                          }}
                        >
                          <Button
                            onClick={handleCloseDeleteDialog}
                            style={{
                              color: colors.grey[100],
                              borderColor: colors.greenAccent[500],
                              marginRight: theme.spacing(1),
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleIGRADelete}
                            style={{
                              backgroundColor: colors.greenAccent[600],
                              color: colors.grey[100],
                            }}
                            autoFocus
                          >
                            Delete
                          </Button>
                        </DialogActions>
                      </Dialog>
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
                        variant="h3"
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
                            handleUpdateDST={handleAddNewDST}
                            caseNumber={caseData.caseNumber}
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
                      <DataGrid rows={dstData} columns={dstColumns} />
                    </Box>
                    {/* Delete Confirmation Dialog */}
                    <Dialog
                        open={openDeleteDialog}
                        onClose={handleCloseDeleteDialog}
                        aria-labelledby="alert-dialog-title"
                        aria-describedby="alert-dialog-description"
                      >
                        <DialogTitle
                          id="alert-dialog-title"
                          style={{
                            color: colors.greenAccent[600],
                            fontSize: "1.5rem",
                          }}
                        >
                          Confirm Deletion
                        </DialogTitle>
                        <DialogContent>
                          <DialogContentText
                            id="alert-dialog-description"
                            style={{ color: colors.grey[100] }}
                          >
                            Are you sure you want to delete this test? This
                            action cannot be undone.
                          </DialogContentText>
                        </DialogContent>
                        <DialogActions
                          style={{
                            justifyContent: "center",
                            padding: theme.spacing(3),
                          }}
                        >
                          <Button
                            onClick={handleCloseDeleteDialog}
                            style={{
                              color: colors.grey[100],
                              borderColor: colors.greenAccent[500],
                              marginRight: theme.spacing(1),
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleDSTDelete}
                            style={{
                              backgroundColor: colors.greenAccent[600],
                              color: colors.grey[100],
                            }}
                            autoFocus
                          >
                            Delete
                          </Button>
                        </DialogActions>
                      </Dialog>

                    {/*  */}
                  </div>
                )}
              </Box>
            </Box>
          </Box>
        ) : (
          currentTab === 1 && (
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
                </Box>
                <Divider
                  variant="fullWidth"
                  style={{
                    backgroundColor: colors.greenAccent[600],
                    color: colors.grey[100],
                    height: "2px",
                    marginTop: theme.spacing(3),
                    marginBottom: theme.spacing(2),
                  }}
                />
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      variant="h3"
                      fontWeight="bold"
                      color={colors.grey[100]}
                      style={{ marginBottom: theme.spacing(1) }}
                    >
                      Diagnostic Test History
                    </Typography>
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
                    <DataGrid rows={diagnosisData} columns={diagnosisColumns} />
                  </Box>
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
                      <DiagnosisDetail
                        handleCloseForm={handleCloseForm}
                        caseNumber={caseData.caseNumber}
                        diagnosisData={diagnosisModalData}
                      />
                    </div>
                  </Modal>
                </div>
                <Divider
                  variant="fullWidth"
                  style={{
                    backgroundColor: colors.greenAccent[600],
                    color: colors.grey[100],
                    height: "1px",
                    marginTop: theme.spacing(2),
                    marginBottom: theme.spacing(2),
                  }}
                />
              </Box>
            </Box>
          )
        )}
        {/* Close Contacts Tab */}
        {currentTab === 2 && (
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
              </Box>
              <Divider
                variant="fullWidth"
                style={{
                  backgroundColor: colors.greenAccent[600],
                  color: colors.grey[100],
                  height: "2px",
                  marginTop: theme.spacing(3),
                  marginBottom: theme.spacing(2),
                }}
              />
            </Box>
          </Box>
        )}
        {/* Assessment Tab */}
        {currentTab === 3 && (
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
              </Box>
              <Divider
                variant="fullWidth"
                style={{
                  backgroundColor: colors.greenAccent[600],
                  color: colors.grey[100],
                  height: "2px",
                  marginTop: theme.spacing(3),
                  marginBottom: theme.spacing(2),
                }}
              />
            </Box>
          </Box>
        )}
        {/* Treatments Tab */}
        {currentTab === 4 && (
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
              </Box>
              <Divider
                variant="fullWidth"
                style={{
                  backgroundColor: colors.greenAccent[600],
                  color: colors.grey[100],
                  height: "2px",
                  marginTop: theme.spacing(3),
                  marginBottom: theme.spacing(2),
                }}
              />
            </Box>
          </Box>
        )}
        {/* Similar Cases Tab */}
        {currentTab === 5 && (
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
              </Box>
              <Divider
                variant="fullWidth"
                style={{
                  backgroundColor: colors.greenAccent[600],
                  color: colors.grey[100],
                  height: "2px",
                  marginTop: theme.spacing(3),
                  marginBottom: theme.spacing(2),
                }}
              />
            </Box>
          </Box>
        )}
      </div>
    </Box>
  );
};

export default Case_Detail;
