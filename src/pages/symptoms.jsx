import React, { useState, useEffect } from 'react';
import {
  TableContainer,
  Paper,
  Table,
  TableBody,
  TableRow,
  TableCell,
} from '@mui/material';
import {
  createTheme,
  ThemeProvider,
  CssBaseline,
  Container,
  Typography,
  TextField,
  Select,
  MenuItem,
  Button,
  Box,
  Dialog,
  DialogContent,
  Divider,
  DialogContentText, 
  DialogTitle,
  DialogActions
} from '@mui/material';
import { useTheme, InputAdornment,  } from '@mui/material';
import { GridToolbar, DataGrid } from '@mui/x-data-grid';
import { tokens } from '../theme';
import Header from '../components/Header';
import { db,auth } from '../firebase.config';
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import PediatricTBSymptomsForm from './PediatricTBSymptomsForm';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import PageviewIcon from '@mui/icons-material/Pageview';
import { useNavigate } from 'react-router-dom';
import SymptomsForm from './PediatricTBSymptomsForm';


const SymptomsReview = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [isAddFormOpen, setAddFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    symptomsReviewDate: '',
    symptoms: '',
    otherSymptoms: '',
    immunizationStatus: '',
    familyHistory: '',
    family: '',
    closeContactWithTB: '',

  });
  const [tableData, setTableData] = useState([]);
  const [searchText, setSearchText] = useState('');

  const handleSearchChange = (event) => {
    setSearchText(event.target.value);
  };

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  useEffect(() => {
    // Load data from Firebase when the component mounts
    loadTableData();
  }, []);


  // Generate sequential IDs for the data
  const loadTableData = async () => {
    const symptomsCollection = collection(db, 'symptoms');
    const symptomsSnapshot = await getDocs(symptomsCollection);
    const data = [];
    symptomsSnapshot.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() });
    });
    setTableData(data);
  };

  const handleAddClick = () => {
    setAddFormOpen(true);
  };

  const [userRole, setUserRole] = useState(null); // State to store the user role

  useEffect(() => {
    // This listener will only set the user role after the auth state has been confirmed
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        const fetchUserRole = async () => {
          const userId = user.uid; // Now you are sure that user is not null
          const userDoc = await getDoc(doc(db, 'users', userId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserRole(userData.role); 
          }
        };
  
        fetchUserRole();
      }
    });
  
    // Unsubscribe from the listener when the component unmounts
    return () => unsubscribe();
  }, []);
  
  // Check if the user has permission to modify the symptoms
  const canModifySymptoms = userRole === 'Admin' || userRole === 'Lab Aide';


  const handleSubmit = async (event) => {
    event.preventDefault();

    // Check if it's an edit or add operation
    if (formData.id) {
      // If `id` exists in formData, it means we are editing an existing record
      try {
        // Update the document in the database
        await updateDoc(doc(db, 'symptoms', formData.id), formData);

        // Update the local table data
        setTableData((prevData) => {
          const updatedData = prevData.map((row) =>
            row.id === formData.id ? { ...row, ...formData } : row
          );
          return updatedData;
        });

        console.log(`Row with ID ${formData.id} updated in the database`);
      } catch (error) {
        console.error('Error updating document: ', error);
      }
    } else {
      // If `id` doesn't exist in formData, it means we are adding a new record
      // Create a new data object with the form values
      const newData = {
        symptomsReviewDate: formData.symptomsReviewDate,
        symptoms: formData.symptoms,
        gender: formData.gender,
        otherSymptoms: formData.otherSymptoms,
        immunizationStatus: formData.immunizationStatus,
        familyHistory: formData.familyHistory,
        family: formData.family,
        closeContactWithTB: formData.closeContactWithTB,
      };
      
      // Save the data to Firebase
      try {
        const symptomsCollection = collection(db, 'symptoms');
        const docRef = await addDoc(symptomsCollection, newData);

        // Update the local table data
        setTableData([...tableData, { id: docRef.id, ...newData }]);

        console.log(`Row with ID ${docRef.id} added to the database`);
      } catch (error) {
        console.error('Error adding document: ', error);
      }
    }

    // Close the form
    setAddFormOpen(false);

    // Clear the form data
    setFormData({
      id: '',
      symptomsReviewDate: '',
      symptoms: '',
      otherSymptoms: '',
      immunizationStatus: '',
      familyHistory: '',
      family: '',
      closeContactWithTB: '',
    });
  };

  const handleEditClick = (id) => {
    // Find the data for the selected row based on its `id`
    const selectedRow = tableData.find((row) => row.id === id);
  
    // Check if the row exists
    if (selectedRow) {
      // Open the dialog for editing
      setAddFormOpen(true);
  
      // Update the form data with the selected row's values and set the ID
      setFormData({
        id: selectedRow.id,
        symptomsReviewDate: selectedRow.symptomsReviewDate,
        symptoms: selectedRow.symptoms,
        otherSymptoms: selectedRow.otherSymptoms,
        immunizationStatus: selectedRow.immunizationStatus,
        familyHistory: selectedRow.familyHistory,
        family: selectedRow.familyHistory.family,
        closeContactWithTB: selectedRow.closeContactWithTB,
        // Add other fields as needed
      });
    } else {
      // Handle the case where the row is not found
      console.error(`Row with ID ${id} not found`);
    }
  };

  const handleDeleteClick = async (id) => {
    // Display a confirmation dialog
    const confirmDeletion = window.confirm('Are you sure you want to delete this row?');

    if (confirmDeletion) {
      // Delete the data from the database
      try {
        setTableData(tableData.filter((row) => row.id !== id));
        // Use the `id` to delete the corresponding document in the database
        await deleteDoc(doc(db, 'symptoms', id));
        console.log(`Row with ID ${id} deleted from the database`);
      } catch (error) {
        console.error('Error deleting document: ', error);
      }
    } else {
      // Handle the case where the user canceled the deletion
      console.log(`Deletion of row with ID ${id} canceled`);
    }
  };

const [selectedRowDetails, setSelectedRowDetails] = useState(null); // State to hold the selected row details
const [viewDetailsOpen, setViewDetailsOpen] = useState(false); // State to control the details modal
const navigate = useNavigate();

// Function to handle the view details button click
const handleViewClick = (id) => {
  const selectedRow = tableData.find((row) => row.id === id);
  if (selectedRow) {
    setSelectedRowDetails(selectedRow);
    setViewDetailsOpen(true);
  }
};

  const columns = [
    { field: 'id', headerName: 'ID', flex: 2 },
    {
      field: 'immunizationStatus',
      headerName: 'Immunization Status',
      flex: 3,
      valueGetter: (params) => {
        const immunization = params.row.immunizationStatus;
        if (immunization && typeof immunization === 'object') {
          // Check if the immunization status is 'No Immunization'
          if (immunization.noImmunization) {
            return 'No Immunization';
          } else {
            // Check if there is a status, otherwise return an empty string
            return immunization.status || '';
          }
        }
        return '';
      },
    },
    {
      field: 'symptomsReviewDate',
      headerName: 'Review Date',
      type: 'date',
      headerAlign: 'left',
      flex: 3,
      align: 'left',
      valueGetter: (params) => {
    // Assuming symptomsReviewDate is a string representation of a date
    return new Date(params.row.symptomsReviewDate);
  },
    },
    {
      field: 'action',
      headerName: 'Action',
      flex: 2.5,
      headerAlign: 'left',
      sortable: false,
      renderCell: (params) => (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>

          {/* View Details Button */}
          <Button
            startIcon={<PageviewIcon />}
            onClick={() => handleViewClick(params.row.id)}
            variant="contained"
            color="primary"
            size="small"
          >
            View
          </Button>
          {/* Edit Button */}
          {canModifySymptoms && (
            <Button
              startIcon={<EditIcon />}
              onClick={() => handleEditClick(params.row.id)}
              variant="contained"
              color="secondary"
              size="small"
            >
              Edit
            </Button>
          )}
          {/* Delete Button */}
          {canModifySymptoms && (
            <Button
              startIcon={<DeleteIcon />}
              onClick={() => handleDeleteClick(params.row.id)}
              variant="contained"
              color="error"
              size="small"
            >
              Delete
            </Button>
          )}
        </div>
      ),
    },
  ];
  

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

<Box m="20px">
      {/* Search and Add Symptoms */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2,
        }}
      >
        {/* Search TextField */}
        <TextField
          placeholder="Search Contacts"
          variant="outlined"
          value={searchText}
          onChange={handleSearchChange}
          sx={{ width: 550, backgroundColor: colors.blueAccent[700], marginLeft: theme.spacing(-2) }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        {/* Add Symptoms Button */}
        {canModifySymptoms && (
            <Button
              variant="contained"
              onClick={handleAddClick}
              style={{
                backgroundColor: colors.greenAccent[600],
                color: colors.grey[100],
                width: "150px",
                height: "50px",
                marginLeft: theme.spacing(2),
              }}
            >
              Add Review
            </Button>
          )}
      </Box>

      {/* Modal for adding new symptoms */}
      <Dialog
        open={isAddFormOpen}
        onClose={() => setAddFormOpen(false)}
        aria-labelledby="add-contact-modal-title"
        aria-describedby="add-contact-modal-description"
        formData={formData} setFormData={setFormData} handleSubmit={handleSubmit}
      >
        <DialogContent>
         <SymptomsForm /> 
        </DialogContent>
      </Dialog>

      {/* DataGrid for Symptoms */}
      <Box
        sx={{
          width: "100%",
          height: "50vh", // Set the height to 70% of the viewport height or adjust as needed
          overflow: "auto", // Enable scrolling if content overflows
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
          // Styles for DataGrid
        }}
      >
        <DataGrid
        rows={tableData}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5, 10, 20]}
        disableSelectionOnClick
      />
        {/* DataGrid component */}
        {/* Delete Confirmation Dialog */}
        <Dialog
         open={openDeleteDialog}
         onClose={handleCloseDeleteDialog}
         aria-labelledby="alert-dialog-title"
         aria-describedby="alert-dialog-description"
       >
         <DialogTitle id="alert-dialog-title">{"Confirm Deletion"}</DialogTitle>
         <DialogContent>
           <DialogContentText id="alert-dialog-description">
             Are you sure you want to delete this review? This action cannot be undone.
           </DialogContentText>
         </DialogContent>
         <DialogActions>
           <Button
             onClick={handleCloseDeleteDialog}
             style={{ color: colors.grey[100], borderColor: colors.greenAccent[500], marginRight: theme.spacing(1) }}
           >
             Cancel
           </Button>
           <Button
             onClick={handleDeleteClick}
             style={{ backgroundColor: colors.greenAccent[600], color: colors.grey[100] }}
             autoFocus
           >
             Delete
           </Button>
         </DialogActions>
        </Dialog>
      </Box>
    </Box>

        <Dialog open={isAddFormOpen} onClose={() => setAddFormOpen(false)}>
          <DialogContent>
            
            {/* Include the PediatricTBSymptomsForm here */}
            <PediatricTBSymptomsForm setAddFormOpen={setAddFormOpen} formData={formData} setFormData={setFormData} handleSubmit={handleSubmit} />
          </DialogContent>
        </Dialog>


      <Dialog
  open={viewDetailsOpen}
  onClose={() => setViewDetailsOpen(false)}
  maxWidth="md"
  fullWidth
>
  <DialogContent>
    {selectedRowDetails && (
      <div style={{ padding: '20px', width: '500px' }}>
        <Typography variant="h6" gutterBottom>
          Symptoms Details
        </Typography>
        <Divider style={{ marginBottom: '15px' }} />
        <TableContainer component={Paper}>
          <Table aria-label="symptoms table">
            <TableBody>
              <TableRow>
                <TableCell>
                  <strong>Symptoms Review Date:</strong>
                </TableCell>
                <TableCell>
                  {selectedRowDetails.symptomsReviewDate}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <strong>Symptoms:</strong>
                </TableCell>
                <TableCell>
                  <ul>
                    {Object.entries(selectedRowDetails.symptoms)
                      .filter(([symptom, isPresent]) => isPresent)
                      .map(([symptom]) => (
                        <li key={symptom}>{symptom.replace(/([a-z])([A-Z])/g, '$1 $2')}</li>
                      ))}
                  </ul>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <strong>Other Symptoms/Remarks:</strong>
                </TableCell>
                <TableCell>
                  {selectedRowDetails.otherSymptoms}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <strong>Immunization Status:</strong>
                </TableCell>
                <TableCell>
                  {selectedRowDetails.immunizationStatus?.status === 'No Immunization'
                    ? 'No Immunization'
                    : selectedRowDetails.immunizationStatus?.status}
                </TableCell>
              </TableRow>
              <TableRow>
              <TableCell>
                <strong>Family History:</strong>
              </TableCell>
              <TableCell>
                {selectedRowDetails.familyHistory?.hasFamilyHistory ? (
                selectedRowDetails.familyHistory.family ? (
                `Yes - ${selectedRowDetails.familyHistory.family}`
                 ) : (
                'Yes - N/A'
                 )
                ) : (
                'No'
                )}
          </TableCell>

              </TableRow>
              <TableRow>
                <TableCell>
                  <strong>Close Contact with TB:</strong>
                </TableCell>
                <TableCell>
                  {selectedRowDetails.closeContactWithTB ? 'Yes' : 'No'}
                </TableCell>
              </TableRow>
              {/* Add other fields as needed */}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    )}
  </DialogContent>
</Dialog>


    </ThemeProvider>
  );
};

export default SymptomsReview;
