import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, auth } from '../../firebase.config';
import { collection, query, where, getDocs, getDoc, deleteDoc, doc } from "firebase/firestore"; 
import { Box, Typography, CircularProgress,Paper, Tab, Grid, Tabs, 
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
       Modal,TextField, InputAdornment, useTheme } from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab'; 
import { DataGrid } from '@mui/x-data-grid';
import Button from '@mui/material/Button';
import PageviewIcon from '@mui/icons-material/Pageview';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import Header from '../../components/Header';
import { tokens } from '../../theme';
import TPForm from '../treatmentPlan/TPform';
import XrayGenForm from '../laboratorytest/xraygenform';
import MTBRIFGenForm from '../laboratorytest/mtbrifgenform';
import TSTGenForm from '../laboratorytest/tstgenform';
import IGRAGenForm from '../laboratorytest/igragenform';
import DSTGenForm from '../laboratorytest/dstgenform';
import LabTestTable from '../laboratorytest/labtesttable';
import DiagnosisDetail from '../laboratorytest/diagnosisdetail';
import { async } from 'q';


const CaseDetail = () => {
  const { caseId } = useParams(); 
  const [currentTab, setCurrentTab] = useState(0);
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nestedTab, setNestedTab] = useState('xray');
  
 // State for treatment plan list
 const [treatmentPlans, setTreatmentPlans] = useState([]);

 const [openTPForm, setOpenTPForm] = useState(false); 

 const [userRole, setUserRole] = useState('');

   // Add a state to control the visibility of XrayGenForm
   const [showXrayForm, setShowXrayForm] = useState(false);

  const handleOpenTPForm = () => 
  setOpenTPForm(true); 

  const handleCloseTPForm = () => 
  setOpenTPForm(false); 


  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // Define your state for searchText and search handling function
const [searchText, setSearchText] = useState('');

const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
const [deleteId, setDeleteId] = useState(null);
const [isAddTPDisabled, setIsAddTPDisabled] = useState(false);

const navigate = useNavigate();

// Add a handler for changing nested tabs
const handleNestedTabChange = (event, newValue) => {
  setNestedTab(newValue);
};

const handleSearchChange = (event) => {
  setSearchText(event.target.value);
};

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  // Function to update the treatment plan list
const handleUpdateTP = (newTP) => {
  setTreatmentPlans([...treatmentPlans, newTP]);
};

// Function to handle edit action
const handleEdit = (id) => {
  navigate(`/dst/edit/${id}`);
};

const handleUpdateXrays = (newXray) => {
  setXrayRows((prevXrays) => [...prevXrays, newXray]);
  // Close the form modal if open
  setShowXrayForm(false);
};

  // Add a function to open the XrayGenForm
  const handleOpenXrayForm = () => {
    setShowXrayForm(true);
  };

  // Add a function to close the XrayGenForm
  const handleCloseXrayForm = () => {
    setShowXrayForm(false);
  };


// Add a state to control the visibility of MTBRIFGenForm
const [showMTBRIFForm, setShowMTBRIFForm] = useState(false);
const [mtbrifs, setMtbrifs] = useState([]);

// Add a function to open the MTBRIFGenForm
const handleOpenMTBRIFForm = () => {
  setShowMTBRIFForm(true);
};

// Add a function to close the MTBRIFGenForm
const handleCloseMTBRIFForm = () => {
  setShowMTBRIFForm(false);
};


// Later in the component, define the handleUpdateMTBRIF function
const handleUpdateMTBRIF = (newMTBRIF) => {
  setMtbrifs(currentMTBRIF => [...currentMTBRIF, newMTBRIF]);
};

  // State to control visibility of TSTGenForm
  const [showTSTForm, setShowTSTForm] = useState(false);
  const [tsts, setTsts] = useState([]);

  const handleOpenTSTForm = () => {
    setShowTSTForm(true);
  };

  const handleCloseTSTForm = () => {
    setShowTSTForm(false);
  };

  const handleUpdateTSTs = (newTST) => {
    setTsts(currentTsts => [...currentTsts, newTST]);
  };


    // State to control visibility of IGRAGenForm
    const [showIGRAForm, setShowIGRAForm] = useState(false);
    const [igras, setIgras] = useState([]);

    const handleOpenIGRAForm = () => {
      setShowIGRAForm(true);
    };

    const handleCloseIGRAForm = () => {
      setShowIGRAForm(false);
    };

    const handleUpdateIGRAs = (newIGRA) => {
      setIgras(currentIgras => [...currentIgras, newIGRA]);
    };

    // State to control visibility of DSTGenForm
    const [showDSTForm, setShowDSTForm] = useState(false);
    const [dsts, setDsts] = useState([]);

    const handleOpenDSTForm = () => {
      setShowDSTForm(true);
    };

    const handleCloseDSTForm = () => {
      setShowDSTForm(false);
    };

    const handleUpdateDSTs = (newDST) => {
      setDsts(currentDsts => [...currentDsts, newDST]);
    };

    //State to control visibility of DiagnosisGenForm
    const [diagnosisData, setDiagnosisData] = useState([]);
    const [diagnosisModalData, setDiagnosisModalData] = useState(null);
    const [open, setOpen] = useState(false);

    const handleOpenForm = () => {
      setOpen(true);
    };

    const handleCloseForm = () => {
      setOpen(false);
    };

    const handleViewDiagnosis = (id) => {
      // Find the specific diagnosis data based on the id
      const selectedDiagnosis = diagnosisData.find(
        (diagnosis) => diagnosis.id === id
      );
      console.log(selectedDiagnosis);
      // Pass the selected diagnosis data to the modal
      setDiagnosisData(selectedDiagnosis);
  
      //Open the Modal
      setOpen(true);
    };

    useEffect(() => {
      const fetchDiagnosisData = async () => {
        try{
          // Fetch diagnosis data
          const queryDiagnosisSnapshot = await getDocs(
            collection(db, "diagnosis")
          );
          const dataDiagnosis = queryDiagnosisSnapshot.docs.map((doc) => ({
            id: doc.id,
            caseReferenceNumber: doc.data().caseReferenceNumber,
            referenceNumber: doc.data().referenceNumber,
            testDate: doc.data().testDate,
            testResult: doc.data().testResult,
            remarks: doc.data().remarks,
            status: doc.data().status,

          }));
          setDiagnosisData(dataDiagnosis);
        } catch (error) {
          console.error("Error fetching data: ", error);
        }
      }

      fetchDiagnosisData();
    },[caseId]);

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
        headerAlign: "center",
        align: "center",
        
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


const viewDetails = (id) => {
  navigate(`/treatmentPlan/${id}`);
};
  // Function to open the dialog and set the treatment plan id to be deleted
  const handleClickOpenDeleteDialog = (id) => {
    setDeleteId(id);
    setOpenDeleteDialog(true);
  };

  // Function to close the delete confirmation dialog
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  // Function to delete the treatment plan
  const handleDeleteTreatmentPlan = async () => {
    try {
      const tpRef = doc(db, "treatmentPlan", deleteId);
      await deleteDoc(tpRef);
      setTreatmentPlans(treatmentPlans.filter((tp) => tp.id !== deleteId));
      handleCloseDeleteDialog(); // Close the dialog after deletion
    } catch (error) {
      console.error("Error deleting treatment plan: ", error);
    }
  };

  useEffect(() => {
    const fetchStartDate = async () => {
      if (!caseId) {
        console.error('caseId is undefined.');
        return; // Exit the function if caseId is not set
      }
  
      try {
        const docRef = doc(db, 'cases', caseId);
        const docSnap = await getDoc(docRef);
  
        if (docSnap.exists()) {
        } else {
          console.log('No such case!');
        }
      } catch (error) {
        console.error('Error fetching case start date:', error);
      }
    };
  
    fetchStartDate();
  }, [caseId]);
  

  useEffect(() => {
    const fetchCaseData = async () => {
        const docRef = doc(db, 'cases', caseId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setCaseData(docSnap.data());
        } else {
          console.log('No such case!');
        }
        setLoading(false);
      };
  
    fetchCaseData();
    }, [caseId]);

    // Xray rows data state
    const [xrayRows, setXrayRows] = useState([]);

    // Fetch Xray tests when the component mounts or when caseId changes
    useEffect(() => {
    const fetchXrayTests = async () => {
      const q = query(collection(db, "xray"), where("caseId", "==", caseId));
      const querySnapshot = await getDocs(q);
      const tests = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        referenceNumber: doc.data().referenceNumber,
        testLocation: doc.data().testLocation,
        testDate: doc.data().testDate,
        testResult: doc.data().testResult,

      }));
      setXrayRows(tests);
    };

    if (caseId) {
      fetchXrayTests();
    }
  }, [caseId]);

  const handleDeleteXray = async (id) => {

      try {
        await deleteDoc(doc(db, "xray", id)); // Replace "xray" with your actual collection name
        // Update local state to remove the item
        setXrayRows((prevRows) => prevRows.filter((row) => row.id !== id));
        console.log(`Xray test with id: ${id} deleted successfully.`);
      } catch (error) {
        console.error("Error deleting Xray test: ", error);
      }

  };
  

  const [mtbrifTests, setMtbrifTests] = useState([]);

  useEffect(() => {
    const fetchMtbrifTests = async () => {
      const q = query(collection(db, "mtbrif"), where("caseId", "==", caseId));
      const querySnapshot = await getDocs(q);
      const tests = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        referenceNumber: doc.data().referenceNumber,
        testLocation: doc.data().testLocation,
        testDate: doc.data().testDate,
        testResult: doc.data().testResult,
      }));
      setMtbrifTests(tests);
    };
  
    if (caseId) {
      fetchMtbrifTests();
    }
  }, [caseId]);

  const handleDeleteMtbrif = async (id) => {
      try {
        await deleteDoc(doc(db, "mtbrif", id)); // Replace "xray" with your actual collection name
        // Update local state to remove the item
        setXrayRows((prevRows) => prevRows.filter((row) => row.id !== id));
        console.log(`Mtb/ Rif test with id: ${id} deleted successfully.`);
      } catch (error) {
        console.error("Error deleting Mtb/ rif test: ", error);
      }
  
  };

  const [tstTests, setTstTests] = useState([]);

  useEffect(() => {
    const fetchTstTests = async () => {
      const q = query(collection(db, "tst"), where("caseId", "==", caseId));
      const querySnapshot = await getDocs(q);
      const tests = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        referenceNumber: doc.data().referenceNumber,
        testLocation: doc.data().testLocation,
        testDate: doc.data().testDate,
        testResult: doc.data().testResult,
      }));
      setTstTests(tests);
    };
  
    if (caseId) {
      fetchTstTests();
    }
  }, [caseId]);


  const handleDeleteTst = async (id) => {

      try {
        await deleteDoc(doc(db, "tst", id)); // Replace "xray" with your actual collection name
        // Update local state to remove the item
        setXrayRows((prevRows) => prevRows.filter((row) => row.id !== id));
        console.log(`Tst test with id: ${id} deleted successfully.`);
      } catch (error) {
        console.error("Error deleting Tst test: ", error);
      }

  };
  const [igraTests, setIgraTests] = useState([]);

  useEffect(() => {
    const fetchIgraTests = async () => {
      const q = query(collection(db, "igra"), where("caseId", "==", caseId));
      const querySnapshot = await getDocs(q);
      const tests = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        referenceNumber: doc.data().referenceNumber,
        testLocation: doc.data().testLocation,
        testDate: doc.data().testDate,
        testResult: doc.data().testResult,
      }));
      setIgraTests(tests);
    };
  
    if (caseId) {
      fetchIgraTests();
    }
  }, [caseId]);
  const handleDeleteIgra = async (id) => {

      try {
        await deleteDoc(doc(db, "igra", id));
        setXrayRows((prevRows) => prevRows.filter((row) => row.id !== id));
        console.log(`Igra test with id: ${id} deleted successfully.`);
      } catch (error) {
        console.error("Error deleting Igra test: ", error);
      }
  };
  const [dstTests, setDstTests] = useState([]);

  useEffect(() => {
    const fetchDstTests = async () => {
      const q = query(collection(db, "dst"), where("caseId", "==", caseId));
      const querySnapshot = await getDocs(q);
      const tests = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        referenceNumber: doc.data().referenceNumber,
        testLocation: doc.data().testLocation,
        testDate: doc.data().testDate,
        amikacin: doc.data().amikacin,
        ethionamide: doc.data().ethionamide,
        fluoroquinolones: doc.data().fluoroquinolones,
        isoniazid: doc.data().isoniazid,
      }));
      setDstTests(tests);
    };
  
    if (caseId) {
      fetchDstTests();
    }
  }, [caseId]);
  
  const handleDeleteDst = async (id) => {

      try {
        await deleteDoc(doc(db, "dst", id)); 
        // Update local state to remove the item
        setDstTests((prevTests) => prevTests.filter((test) => test.id !== id));
        console.log(`DST test with id: ${id} deleted successfully.`);
      } catch (error) {
        console.error("Error deleting DST test: ", error);
      }
  
  };
  
    // Fetch treatment plans for the specific case
    useEffect(() => {
      const fetchRelatedTreatmentPlans = async () => {
        try {
          // Query the treatmentPlan collection for documents where caseId matches
          const q = query(collection(db, "treatmentPlan"), where("caseId", "==", caseId));
          const querySnapshot = await getDocs(q);
          const plans = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
          }));
          setTreatmentPlans(plans); // Update state with fetched treatment plans
        } catch (error) {
          console.error("Error fetching related treatment plans: ", error);
        }
      };
  
      if (caseId) { 
        fetchRelatedTreatmentPlans();
      }
    }, [caseId]);

    useEffect(() => {
      const fetchUserRole = async () => {
        if (auth.currentUser) {
          const userRef = doc(db, 'users', auth.currentUser.uid);
          const docSnap = await getDoc(userRef);
          if (docSnap.exists()) {
            setUserRole(docSnap.data().role);
            setIsAddTPDisabled(!canEditOrDelete(docSnap.data().role));
          } else {
            console.error("User document not found");
          }
        }
      };
  
      fetchUserRole();
    }, []);

    // Define a utility function to check if the user can edit or delete
    const canEditOrDelete = (role) => {
      return ['Admin', 'Lab Aide'].includes(role) && !['Parent', 'Doctor'].includes(role);
    };

     // Define columns for DataGrid
     const treatmentColumns = [
        { field: 'duration', headerName: 'Duration', flex: 1 },
        { field: 'drug', headerName: 'Medicine/Type of Drug Intake', flex: 1 },
        { field: 'dosage', headerName: 'Dosage', flex: 1 },
        { field: 'frequency', headerName: 'Frequency', flex: 1 },
        { field: 'status',
         headerName: 'Status', 
         flex: 1, 
         renderCell: (params) => (
          <Typography
            style={{
              color: params.value === 'End' ? 'lightcoral' : 'lightgreen', 
            }}
          >
            {params.value}
          </Typography>
        ),
        },
        {
          field: 'action',
          headerName: 'Action',
          sortable: false,
          flex: 1, 
          // Hide edit/delete actions based on user role
           hide: isAddTPDisabled,
          renderCell: (params) => (
            <Box display="flex" justifyContent="center">
              <Button
                startIcon={<PageviewIcon />}
                onClick={() => viewDetails(params.id)}
                variant="contained"
                color="primary"
                size="small"
                style={{ marginRight: 8 }}
              >
                View
              </Button>
              {/* Conditionally show edit and delete options */}
              {canEditOrDelete(userRole) && (
            <>
              <Button
                startIcon={<EditIcon />}
                onClick={() => navigate(`/treatmentPlan/edit/${params.id}`)}
                variant="contained"
                color="secondary"
                size="small"
                style={{ marginRight: 8 }}
              >
                Edit
              </Button>
              <Button
                startIcon={<DeleteIcon />}
                onClick={() => handleClickOpenDeleteDialog(params.id)}
                variant="contained"
                color="error"
                size="small"
              >
                Delete
              </Button>
            </>
          )}
        </Box>
      ),
    },
  ].filter(Boolean);


    const dstcolumns = [
      { field: 'referenceNumber', headerName: 'Reference', flex: 1 },
      { field: 'testLocation', headerName: 'Test Location', flex: 1 },
      { field: 'testDate', headerName: 'Date Tested', flex: 1 },
      { field: 'amikacin', headerName: 'Amikacin', flex: 1 },
      { field: 'ethionamide', headerName: 'Ethionamide', flex: 1 },
      { field: 'fluoroquinolones', headerName: 'Fluoroquinolones', flex: 1 },
      { field: 'isoniazid', headerName: 'Isoniazid', flex: 1 },
      // ... other fields
    /*  {
        field: 'action',
        headerName: 'Action',
        sortable: false,
        flex: 1,
        renderCell: (params) => (
          <Box display="flex" justifyContent="center">
            { <Button
              startIcon={<EditIcon />}
              onClick={() => navigate(`/dst/edit/${params.id}`)}
              variant="contained"
              color="secondary"
              size="small"
              style={{ marginRight: 8 }}
            >
              Edit
            </Button> }
            <Button
              startIcon={<DeleteIcon />}
              onClick={() => handleDeleteDst(params.id)}
              variant="contained"
              color="error"
              size="small"
            >
              Delete
            </Button>
          </Box>
        ),

    }*/
    
    ];
  
  if (loading) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' height='100vh'>
        <CircularProgress />
      </Box>
    );
  }

    // Function to format date
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
      };


  // Modal style
  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '70vw',
    maxWidth: '1000px',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    overflowY: 'auto' 
  };

  return (
    <Box padding={2} bgcolor="background.default" color="text.primary">
   <Header title="Case Details" />
   <Paper elevation={2} style={{ padding: theme.spacing(2), marginTop: theme.spacing(3), backgroundColor: colors.grey[800], borderRadius: theme.shape.borderRadius }}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item>
            <Typography variant="body2" color="text.secondary">Case No:</Typography>
            <Typography variant="body1">{caseData?.caseNumber}</Typography>
          </Grid>
          <Grid item>
            <Typography variant="body2" color="text.secondary">Patient Name:</Typography>
            <Typography variant="body1">{caseData?.fullName}</Typography>
          </Grid>
          <Grid item>
            <Typography variant="body2" color="text.secondary">Case Start Date:</Typography>
            <Typography variant="body1">{formatDate(caseData?.startDate)}</Typography>
          </Grid>
          <Grid item>
            <Typography variant="body2" color="text.secondary">Case End Date:</Typography>
            <Typography variant="body1">{formatDate(caseData?.endDate)}</Typography>
          </Grid>
          <Grid item>
            <Typography variant="body2" color="text.secondary">Case Status:</Typography>
            <Box
                component="span"
                sx={{
                    display: 'inline-block',
                    bgcolor: caseData?.caseStatus === 'Open' ? 'success.main' : 'error.main',
                    borderRadius: '16px',
                    px: 2,
                    py: 0.5
                }}
                >
                <Typography variant="body1" color="text.primary">{caseData?.caseStatus}</Typography>
                </Box>
          </Grid>
        </Grid>
      </Paper>
      <Tabs
      value={currentTab}
      onChange={handleTabChange}
      indicatorColor="secondary"
      textColor="inherit"
      variant="standard"
      >       
       <Tab label='Laboratory Test' />
      <Tab label='Diagnosis' />
        <Tab label='Close Contacts' />
        <Tab label='Assessment' />
        <Tab label='Treatment Plan' />
        <Tab label='Similar Cases' />
        {/* Add other tabs as needed */}
      </Tabs>

      {currentTab === 0 && (
   <Box m="20px">
   <TabContext value={nestedTab}>
     <Box sx={{ borderBottom: 1, borderColor: 'divider', justifyContent: 'center', display: 'flex' }}>
       <TabList 
         onChange={handleNestedTabChange} 
         aria-label="lab test tabs" 
         variant="scrollable" 
         scrollButtons="auto"
         allowScrollButtonsMobile
         sx={{
          '.MuiTabs-flexContainer': {
            justifyContent: 'center', 
          },
          '.MuiTab-root': {
            color: colors.grey[500], 
            '&.Mui-selected': {
              color: '#fff', 
            },
          },
          '.MuiTabs-indicator': {
            backgroundColor: colors.greenAccent[600], 
          },
        }}
       >
         <Tab label="Xray Tests" value="xray" />
         <Tab label="MTB/RIF Tests" value="mtbrif" />
         <Tab label="TST Tests" value="tst" />
         <Tab label="IGRA Tests" value="igra" />
         <Tab label="DST Tests" value="dst" />
       </TabList>
     </Box>

      {/* XRay tests content */}
        <TabPanel value="xray">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4">Xray Tests</Typography>
            {canEditOrDelete(userRole) && (
              <Button
                variant="contained"
                onClick={handleOpenXrayForm}
                style={{
                  backgroundColor: colors.greenAccent[600],
                  color: colors.grey[100],
                  height: '50px',
                  marginLeft: theme.spacing(2),
                }}s
              >
                Add New Xray
              </Button>
            )}
          </Box>
          {/* Modal for adding new Xray */}
          <Modal
            open={showXrayForm}
            onClose={handleCloseXrayForm}
            aria-labelledby="simple-modal-title"
            aria-describedby="simple-modal-description"
          >
            <Box sx={modalStyle}>
              <XrayGenForm
                handleCloseForm={handleCloseXrayForm}
                handleUpdateXrays={handleUpdateXrays}
                caseNumber={caseData?.caseNumber}
                caseId={caseId} 
              />
            </Box>
          </Modal>            
           {/* Call to LabTestTable for displaying existing Xray tests */}
             <LabTestTable 
            onEdit={handleEdit}
            onDelete={handleDeleteXray}            
             rows={xrayRows} />
     
        </TabPanel>

       {/* MTB/RIF tests content */}
       <TabPanel value="mtbrif">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4">MTBRIF Tests</Typography>
          {canEditOrDelete(userRole) && (
          <Button 
            variant="contained" 
            onClick={handleOpenMTBRIFForm}
            style={{
              backgroundColor: colors.greenAccent[600],
              color: colors.grey[100],
              height: '50px',
              marginLeft: theme.spacing(2)
            }}
          >
            Add New MTBRIF
          </Button>
          )}
        </Box>
        {/* Modal for adding new MTBRIF */}
        <Modal
          open={showMTBRIFForm}
          onClose={handleCloseMTBRIFForm}
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
        >
          <Box sx={modalStyle}>
            <MTBRIFGenForm
              handleCloseForm={handleCloseMTBRIFForm}
              handleUpdateMTBRIF={handleUpdateMTBRIF}
              caseNumber={caseData?.caseNumber}
              caseId={caseId}
            />
          </Box>
        </Modal>
        {/* Call to LabTestTable for displaying existing MTBRIF tests */}
        <LabTestTable 
        onEdit={handleEdit}
        onDelete={handleDeleteMtbrif}  
        rows={mtbrifTests} />
      </TabPanel>


    {/* TST tests content */}
    <TabPanel value="tst">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4">TST Tests</Typography>
          {canEditOrDelete(userRole) && (
          <Button 
            variant="contained" 
            onClick={handleOpenTSTForm}
            style={{
              backgroundColor: colors.greenAccent[600],
              color: colors.grey[100],
              height: '50px',
              marginLeft: theme.spacing(2)
            }}
          >
            Add New TST
          </Button>
          )}
        </Box>
        {/* Modal for adding new TST */}
        <Modal
          open={showTSTForm}
          onClose={handleCloseTSTForm}
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
        >
          <Box sx={modalStyle}>
            <TSTGenForm
              handleCloseForm={handleCloseTSTForm}
              handleUpdateTSTs={handleUpdateTSTs}
              caseNumber={caseData?.caseNumber}
              caseId={caseId}
            />
          </Box>
        </Modal>
        {/* Call to LabTestTable for displaying existing TST tests */}
        <LabTestTable 
        onEdit={handleEdit}
        onDelete={handleDeleteTst}  
        rows={tstTests} />
      </TabPanel>

       {/* IGRA tests content */}
       <TabPanel value="igra">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4">IGRA Tests</Typography>
            {canEditOrDelete(userRole) && (
            <Button
              variant="contained"
              onClick={handleOpenIGRAForm}
              style={{
                backgroundColor: colors.greenAccent[600],
                color: colors.grey[100],
                height: '50px',
                marginLeft: theme.spacing(2),
              }}
            >
              Add New IGRA
            </Button>
            )}
          </Box>
          {/* Modal for adding new IGRA */}
          <Modal
            open={showIGRAForm}
            onClose={handleCloseIGRAForm}
            aria-labelledby="simple-modal-title"
            aria-describedby="simple-modal-description"
          >
            <Box sx={modalStyle}>
              <IGRAGenForm
                handleCloseForm={handleCloseIGRAForm}
                handleUpdateIGRAs={handleUpdateIGRAs}
                caseNumber={caseData?.caseNumber}
                caseId={caseId}
              />
            </Box>
          </Modal>
        {/* Call to LabTestTable for displaying existing IGRA tests */}
        <LabTestTable 
         onEdit={handleEdit}
         onDelete={handleDeleteIgra}         
        rows={igraTests} />
        </TabPanel>

       {/* DST tests content */}
       <TabPanel value="dst">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4">DST Tests</Typography>
          {canEditOrDelete(userRole) && (
          <Button
            variant="contained"
            onClick={handleOpenDSTForm}
            style={{
              backgroundColor: colors.greenAccent[600],
              color: colors.grey[100],
              height: '50px',
              marginLeft: theme.spacing(2),
            }}
          >
            Add New DST
          </Button>
          )}
        </Box>
        {/* Modal for adding new DST */}
        <Modal
          open={showDSTForm}
          onClose={handleCloseDSTForm}
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
        >
          <Box sx={modalStyle}>
            <DSTGenForm
              handleCloseForm={handleCloseDSTForm}
              handleUpdateDSTs={handleUpdateDSTs}
              caseNumber={caseData?.caseNumber}
              caseId={caseId}
            />
          </Box>
        </Modal>

        <Box
              sx={{
              height: 350, 
              width: "100%",
              "& .MuiDataGrid-root": {
                  border: `1px solid ${colors.primary[700]}`,
                  color: colors.grey[100],
                  backgroundColor: colors.primary[400],
              },
              "& .MuiDataGrid-columnHeaders": {
                  backgroundColor: colors.blueAccent[700],
                  color: colors.grey[100],
              },
              "& .MuiDataGrid-cell": {
                  borderBottom: `1px solid ${colors.primary[700]}`,
              },
              "& .MuiDataGrid-footerContainer": {
                  borderTop: `1px solid ${colors.primary[700]}`,
                  backgroundColor: colors.blueAccent[700],
                  color: colors.grey[100],
              },
              "& .MuiCheckbox-root": {
                  color: colors.greenAccent[200],
              },
              "& .MuiDataGrid-toolbarContainer": {
                  color: colors.grey[100],
              },
              }}
          >
            <DataGrid
            rows={dstTests}
            columns={dstcolumns}
            pageSize={5}
            rowsPerPageOptions={[5, 10, 20]}
            />
          </Box>

      </TabPanel>


   </TabContext>
 </Box>
      )}

      {currentTab === 1 && (
         <  Box m="20px">
           {/* Your Diagnosis tab content here */}
           
              <Box mt="25px" p="30px">      
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
                      fontWeight="regular"
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
                      height: 350,
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
                        diagnosisData={diagnosisData}
                      />
                    </div>
                  </Modal>
                </div>
              </Box>
            </Box>
      )}

    {currentTab === 2 && (
         <  Box m="20px">
           {/* Your Close Contact tab content here */}
        </Box>
      )}

    {currentTab === 3 && (
         <  Box m="20px">
           {/* Your Assessment tab content here */}
        </Box>
      )}

      {currentTab === 4 && (
       <  Box m="20px">
        {/* Your Treatment Plan tab content here */}
        <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center', // Align items vertically
        p: 2,
      }}>
          <TextField
            placeholder="Search Treatments"
            variant="outlined"
            value={searchText}
            onChange={handleSearchChange}
            sx={{ width: 550, backgroundColor: colors.blueAccent[700] , marginLeft: theme.spacing(-2) }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          {/* Conditionally render the "Add Treatment" button based on the user role */}
          {!isAddTPDisabled && (
            <Button
              variant="contained"
              onClick={handleOpenTPForm}
              style={{
                backgroundColor: colors.greenAccent[600],
                color: colors.grey[100],
                width: "125px",
                height: "50px",
                marginLeft: theme.spacing(2),
              }}
            >
              Add Treatment
            </Button>
          )}
            </Box>
             {/* Modal for adding new treatment */}
             <Modal
                open={openTPForm}
                onClose={handleCloseTPForm}
                aria-labelledby="add-treatment-modal-title"
                aria-describedby="add-treatment-modal-description"
              >
                <Box sx={modalStyle}>
                  {/* Pass the case details as props to TPForm */}
                  <TPForm
                    caseId={caseId}
                    caseNumber={caseData?.caseNumber}
                    startDate={caseData?.startDate}
                    handleCloseForm={handleCloseTPForm}
                    handleUpdateTP={handleUpdateTP} // Assuming you have this function in your CaseDetail component
                  />
                </Box>
              </Modal>
          <Box
            sx={{
            height: 410, 
            width: "100%",
            "& .MuiDataGrid-root": {
                border: `1px solid ${colors.primary[700]}`,
                color: colors.grey[100],
                backgroundColor: colors.primary[400],
            },
            "& .MuiDataGrid-columnHeaders": {
                backgroundColor: colors.blueAccent[700],
                color: colors.grey[100],
            },
            "& .MuiDataGrid-cell": {
                borderBottom: `1px solid ${colors.primary[700]}`,
            },
            "& .MuiDataGrid-footerContainer": {
                borderTop: `1px solid ${colors.primary[700]}`,
                backgroundColor: colors.blueAccent[700],
                color: colors.grey[100],
            },
            "& .MuiCheckbox-root": {
                color: colors.greenAccent[200],
            },
            "& .MuiDataGrid-toolbarContainer": {
                color: colors.grey[100],
            },
            }}
        >
         <DataGrid
            rows={treatmentPlans}
            columns={treatmentColumns}
            pageSize={5}
            rowsPerPageOptions={[5, 10, 20]}
            disableSelectionOnClick
            />
            {/* Delete Confirmation Dialog */}
            <Dialog
              open={openDeleteDialog}
              onClose={handleCloseDeleteDialog}
              aria-labelledby="alert-dialog-title"
              aria-describedby="alert-dialog-description"
            >
              <DialogTitle id="alert-dialog-title">
                {"Confirm Deletion"}
              </DialogTitle>
              <DialogContent>
                <DialogContentText id="alert-dialog-description">
                  Are you sure you want to delete this treatment plan? This action cannot be undone.
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseDeleteDialog} style={{ color: colors.grey[100], borderColor: colors.greenAccent[500], marginRight: theme.spacing(1) }}>
                  Cancel
                </Button>
                <Button onClick={handleDeleteTreatmentPlan} style={{ backgroundColor: colors.greenAccent[600], color: colors.grey[100] }} autoFocus>
                  Delete
                </Button>
              </DialogActions>
            </Dialog>


            </Box>
        </Box>
      )}

      {currentTab === 5 && (
         <  Box m="20px">
           {/* Your Similar Cases content here */}
        </Box>
      )}
    </Box>
  );
};
export default CaseDetail;