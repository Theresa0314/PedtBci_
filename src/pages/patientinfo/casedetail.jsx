import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../firebase.config';
import { collection, query, where, getDocs, getDoc, deleteDoc, doc } from "firebase/firestore"; 
import { Box, Typography, CircularProgress, Container, Paper, Tab, Grid, Tabs, 
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
       Modal,TextField, InputAdornment, useTheme } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import Button from '@mui/material/Button';
import PageviewIcon from '@mui/icons-material/Pageview';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import Header from '../../components/Header';
import { tokens } from '../../theme';
import TPForm from '../treatmentPlan/TPform';

const CaseDetail = () => {
  const { caseId } = useParams(); 
  const [currentTab, setCurrentTab] = useState(0);
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  
 // State for treatment plan list
 const [treatmentPlans, setTreatmentPlans] = useState([]);

 const [openTPForm, setOpenTPForm] = useState(false); 

  const handleOpenTPForm = () => setOpenTPForm(true); 
  const handleCloseTPForm = () => setOpenTPForm(false); 


  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // Define your state for searchText and search handling function
const [searchText, setSearchText] = useState('');

const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
const [deleteId, setDeleteId] = useState(null);


const navigate = useNavigate();

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
  
      if (caseId) { // Check if caseId is not null or undefined
        fetchRelatedTreatmentPlans();
      }
    }, [caseId]);

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
            </Box>
          ),
          flex: 1,
        },
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
    width: '70vw', // Set width to 80% of the viewport width
    maxWidth: '1000px', // Set a maximum width for larger screens
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    overflowY: 'auto' // Add scroll for smaller screens
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
      {/*  <Tab label='Contact Tracing' />*/}
        <Tab label='Treatment Plan' />
        {/* Add other tabs as needed */}
      </Tabs>

    {/*  {currentTab === 0 && (
        <Container>
           Content for Contact Tracing 
        </Container>
      )}*/}

      {currentTab === 0 && (
  <     Box m="20px">
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

      {/* Add other tab contents as needed */}
    </Box>
  );
};

export default CaseDetail;
