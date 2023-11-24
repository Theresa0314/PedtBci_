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

const [xrays, setXrays] = useState([]);

// Function to update the list of x-rays
const handleUpdateXrays = (newXray) => {
  // Use the spread operator to include the new x-ray in the existing list
  setXrays(currentXrays => [...currentXrays, newXray]);
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
      return ['Admin', 'Lab Aide'].includes(role);
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
            <Button
              variant="contained"
              onClick={handleOpenXrayForm}
              style={{
                backgroundColor: colors.greenAccent[600],
                color: colors.grey[100],
                height: '50px',
                marginLeft: theme.spacing(2),
              }}
            >
              Add New Xray
            </Button>
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
          {/* Your DataGrid for displaying existing x-rays should be here */}
        </TabPanel>

       {/* MTB/RIF tests content */}
       <TabPanel value="mtbrif">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4">MTBRIF Tests</Typography>
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
        {/* Your DataGrid for displaying existing MTBRIF tests should be here */}
      </TabPanel>


    {/* TST tests content */}
    <TabPanel value="tst">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4">TST Tests</Typography>
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
        {/* Your DataGrid for displaying existing TSTs should be here */}
      </TabPanel>

       {/* IGRA tests content */}
       <TabPanel value="igra">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4">IGRA Tests</Typography>
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
          {/* Your DataGrid for displaying existing IGRAs should be here */}
        </TabPanel>

       {/* DST tests content */}
       <TabPanel value="dst">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4">DST Tests</Typography>
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
        {/* Your DataGrid for displaying existing DSTs should be here */}
      </TabPanel>


   </TabContext>
 </Box>
      )}

      {currentTab === 1 && (
         <  Box m="20px">
           {/* Your Diagnosis tab content here */}
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
            height: 500, 
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