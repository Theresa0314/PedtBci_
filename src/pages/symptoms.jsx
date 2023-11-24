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
} from '@mui/material';
import { useTheme } from '@mui/material';
import { GridToolbar, DataGrid } from '@mui/x-data-grid';
import { tokens } from '../theme';
import Header from '../components/Header';
import { db } from '../firebase.config';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import PediatricTBSymptomsForm from './PediatricTBSymptomsForm';


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

  useEffect(() => {
    // Load data from Firebase when the component mounts
    loadTableData();
  }, []);

  const loadTableData = async () => {
    const symptomsCollection = collection(db, 'symptoms');
    const symptomsSnapshot = await getDocs(symptomsCollection);
    const data = [];
    // Convert the snapshot to an array and iterate through it using forEach
    symptomsSnapshot.forEach((doc) => {
    data.push(doc.data());
  });

  // Generate sequential IDs for the data
    const formattedData = data.map((item, index) => ({ id: index + 1, ...item }));
    setTableData(formattedData);
  };

  const handleAddClick = () => {
    setAddFormOpen(true);
  };

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

// Function to handle the view details button click
const handleViewClick = (id) => {
  const selectedRow = tableData.find((row) => row.id === id);
  if (selectedRow) {
    setSelectedRowDetails(selectedRow);
    setViewDetailsOpen(true);
  }
};

  const columns = [
    { field: 'id', headerName: 'ID', flex: 1 },
    {
      field: 'view',
      headerName: '',
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <div>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => handleViewClick(params.row.id)}
          >
            View Details
          </Button>
        </div>
      ),
    },
    {
      field: 'symptomsReviewDate',
      headerName: 'Review Date',
      type: 'date',
      headerAlign: 'left',
      flex: 1.5,
      align: 'left',
      valueGetter: (params) => {
    // Assuming symptomsReviewDate is a string representation of a date
    return new Date(params.row.symptomsReviewDate);
  },
    },
    {
      field: 'action',
      headerName: 'Action',
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <div>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleEditClick(params.row.id)}
          >
            Edit
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => handleDeleteClick(params.row.id)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];
  

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container component="div" maxWidth="lg">
        <Header
          title="Pediatric TB - Symptoms Review"
          subtitle="List of Symptoms Reviews"
        />

        <Box m="40px 0 0 0" height="75vh">
          <Box
            sx={{
              '& .MuiDataGrid-root': {
                border: 'none',
              },
              '& .MuiDataGrid-cell': {
                borderBottom: 'none',
              },
              '& .name-column--cell': {
                color: colors.greenAccent[300],
              },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: colors.blueAccent[700],
                borderBottom: 'none',
              },
              '& .MuiDataGrid-virtualScroller': {
                backgroundColor: colors.primary[400],
              },
              '& .MuiDataGrid-footerContainer': {
                borderTop: 'none',
                backgroundColor: colors.blueAccent[700],
              },
              '& .MuiCheckbox-root': {
                color: `${colors.greenAccent[200]} !important`,
              },
              '& .MuiDataGrid-toolbarContainer .MuiButton-text': {
                color: `${colors.grey[100]} !important`,
              },
            }}
          >
            <Button
              variant="contained"
              color="secondary"
              onClick={handleAddClick}
              style={{ marginRight: '8px' }}
            >
              Add Symptoms Review
            </Button>

            <DataGrid rows={tableData} columns={columns} components={{ Toolbar: GridToolbar }} />
          </Box>
        </Box>

        <Dialog open={isAddFormOpen} onClose={() => setAddFormOpen(false)}>
          <DialogContent>
            {/* Include the PediatricTBSymptomsForm here */}
            <PediatricTBSymptomsForm setAddFormOpen={setAddFormOpen} formData={formData} setFormData={setFormData} handleSubmit={handleSubmit} />
          </DialogContent>
        </Dialog>
      </Container>

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
