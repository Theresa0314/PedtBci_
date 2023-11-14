import React, { useState, useEffect } from 'react';
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

const SymptomsReview = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  


  const [isAddFormOpen, setAddFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: '', // Include ID for editing
    name: '',
    dateOfBirth: '',
    gender: '',
    symptoms: '',
    temperature: '',
    remarks: '',
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
    symptomsSnapshot.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() });
    });
    setTableData(data);
  };

  const handleAddClick = () => {
    setAddFormOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
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
        name: formData.name,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        symptoms: formData.symptoms,
        temperature: formData.temperature,
        remarks: formData.remarks,
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
      name: '',
      dateOfBirth: '',
      gender: '',
      symptoms: '',
      temperature: '',
      remarks: '',
    });
  };

  const handleEditClick = (id) => {
    // Find the data for the selected row based on its `id`
    const selectedRow = tableData.find((row) => row.id === id);

    // Check if the row exists
    if (selectedRow) {
      // Update the form data with the selected row's values and set the ID
      setFormData({
        id: selectedRow.id, // Set the ID in formData
        name: selectedRow.name,
        dateOfBirth: new Date(selectedRow.dateOfBirth),
        gender: selectedRow.gender,
        symptoms: selectedRow.symptoms,
        temperature: selectedRow.temperature,
        remarks: selectedRow.remarks,
      });

      // Open the dialog for editing
      setAddFormOpen(true);
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

  const columns = [
    { field: 'id', headerName: 'ID', flex: 0.1 },
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
    },
    {
      field: 'dateOfBirth',
      headerName: 'Date Of Birth',
      type: 'date',
      headerAlign: 'left',
      align: 'left',
      valueGetter: (params) => {
        // Convert the date string to a Date object
        return new Date(params.row.dateOfBirth);
      },
    },
    {
      field: 'gender',
      headerName: 'Gender',
      flex: 0.5,
    },
    {
      field: 'symptoms',
      headerName: 'Symptoms',
      flex: 1,
    },
    {
      field: 'temperature',
      headerName: 'Temperature',
      flex: 0.7,
    },
    {
      field: 'remarks',
      headerName: 'Remarks',
      flex: 1,
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
          title="Pediatric TB Symptoms Review"
          subtitle="List of Symptoms Reviews for Decision Making"
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
              Add Data
            </Button>

            <DataGrid rows={tableData} columns={columns} components={{ Toolbar: GridToolbar }} />
          </Box>
        </Box>

        <Dialog open={isAddFormOpen} onClose={() => setAddFormOpen(false)}>
          <DialogContent>
            <div className="container mt-5">
              <h1>Pediatric TB Symptoms Review Form</h1>
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group col-md-6">
                    <label htmlFor="name">Name:</label>
                    <TextField
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      required
                      fullWidth
                      margin="normal"
                    />
                  </div>
                  <div className="form-group col-md-6">
                    <label htmlFor="dateOfBirth">Date Of Birth:</label>
                    <TextField
                      type="date"
                      id="dateOfBirth"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleFormChange}
                      required
                      fullWidth
                      margin="normal"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group col-md-3">
                    <label htmlFor="gender">Gender:</label>
                    <Select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleFormChange}
                      required
                      fullWidth
                      margin="normal"
                    >
                      <MenuItem value="">Choose...</MenuItem>
                      <MenuItem value="Male">Male</MenuItem>
                      <MenuItem value="Female">Female</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </Select>
                  </div>
                  <div className="form-group col-md-9">
                    <label htmlFor="symptoms">Symptoms:</label>
                    <TextField
                      type="text"
                      id="symptoms"
                      name="symptoms"
                      value={formData.symptoms}
                      onChange={handleFormChange}
                      required
                      fullWidth
                      margin="normal"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group col-md-6">
                    <label htmlFor="temperature">Temperature:</label>
                    <TextField
                      type="text"
                      id="temperature"
                      name="temperature"
                      value={formData.temperature}
                      onChange={handleFormChange}
                      required
                      fullWidth
                      margin="normal"
                    />
                  </div>
                  <div className="form-group col-md-6">
                    <label htmlFor="remarks">Remarks:</label>
                    <TextField
                      type="text"
                      id="remarks"
                      name="remarks"
                      value={formData.remarks}
                      onChange={handleFormChange}
                      required
                      fullWidth
                      margin="normal"
                    />
                  </div>
                </div>
                <div className="d-flex justify-content-center align-items-center">
                  <Button type="submit" variant="contained" color="secondary">
                    Submit
                  </Button>
                </div>
              </form>
            </div>
          </DialogContent>
        </Dialog>
      </Container>
    </ThemeProvider>
  );
};

export default SymptomsReview;
