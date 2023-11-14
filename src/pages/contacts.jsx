import React, { useState, useEffect } from 'react';
import {
  createTheme,
  ThemeProvider,
  CssBaseline,
  Container,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextareaAutosize,
  Button,
} from '@mui/material';
import { useTheme } from '@mui/material';
import { Box, Dialog, DialogContent } from '@mui/material';
import { GridToolbar, DataGrid } from '@mui/x-data-grid';
import { tokens } from '../theme'; // Import your theme tokens from your theme file
import Header from '../components/Header';
import { db } from '../firebase.config'; // Firebase configuration
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';

const Contacts = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [isAddFormOpen, setAddFormOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    birthday: '',
    gender: '',
    relationship: '',
    contact: '',
    email: '',
    init: '',
    ff: '',
    remarks: '',
  });

  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    // Load data from Firebase when the component mounts
    loadTableData();
  }, []);

  const loadTableData = async () => {
    const contactsCollection = collection(db, 'contactTracing');
    const contactsSnapshot = await getDocs(contactsCollection);
    const data = [];
    contactsSnapshot.forEach((doc) => {
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
        await updateDoc(doc(db, 'contactTracing', formData.id), formData);
  
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
        birthday: formData.birthday,
        gender: formData.gender,
        relationship: formData.relationship,
        contact: formData.contact,
        email: formData.email,
        init: formData.init,
        ff: formData.ff,
        remarks: formData.remarks,
      };
  
      // Save the data to Firebase
      try {
        const contactsCollection = collection(db, 'contactTracing');
        const docRef = await addDoc(contactsCollection, newData);
  
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
      name: '',
      birthday: '',
      gender: '',
      relationship: '',
      contact: '',
      email: '',
      init: '',
      ff: '',
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
        birthday: new Date(selectedRow.birthday),
        gender: selectedRow.gender,
        relationship: selectedRow.relationship,
        contact: selectedRow.contact,
        email: selectedRow.email,
        init: new Date(selectedRow.init),
        ff: new Date(selectedRow.ff),
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
    const confirmDeletion = window.confirm("Are you sure you want to delete this row?");
  
    if (confirmDeletion) {
      // Delete the data from the database
      try {
        setTableData(tableData.filter((row) => row.id !== id));
        // Use the `id` to delete the corresponding document in the database
        await deleteDoc(doc(db, 'contactTracing', id));
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
      field: 'birthday',
      headerName: 'Date Of Birth',
      type: 'date',
      headerAlign: 'left',
      align: 'left',
      valueGetter: (params) => {
        // Convert the date string to a Date object
        return new Date(params.row.birthday);
      },
    },
    {
      field: 'gender',
      headerName: 'Gender',
      flex: 0.5,
    },
    {
      field: 'relationship',
      headerName: 'Relationship to Patient',
      flex: 1,
    },
    {
      field: 'contact',
      headerName: 'Contact Number',
      flex: 0.7,
    },
    {
      field: 'email',
      headerName: 'Email Address',
      flex: 1,
    },
    {
      field: 'init',
      headerName: 'Initial Screening',
      type: 'date',
      flex: 0.5,
      valueGetter: (params) => {
        // Convert the date string to a Date object
        return new Date(params.row.init);
      },
    },
    {
      field: 'ff',
      headerName: 'FF-up',
      type: 'date',
      flex: 0.5,
      valueGetter: (params) => {
        // Convert the date string to a Date object
        return new Date(params.row.ff);
      },
    },
    {
      field: 'remarks',
      headerName: 'Remarks(TB/TPT Case No.)',
      flex: 0.5,
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
          title="Contact Tracing"
          subtitle="List of Contacts for Future Reference"
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
              style={{ marginRight: '8px' }} // Add margin to the right
            >
              Add Data
            </Button>

            <DataGrid rows={tableData} columns={columns} components={{ Toolbar: GridToolbar }} />
          </Box>
        </Box>

        <Dialog open={isAddFormOpen} onClose={() => setAddFormOpen(false)}>
          <DialogContent>
            <div className="container mt-5">
              <h1>Contact Tracing Form - Pediatric TB</h1>
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
                    <label htmlFor="birthday">Date Of Birth:</label>
                    <TextField
                      type="date"
                      id="birthday"
                      name="birthday"
                      value={formData.birthday}
                      onChange={handleFormChange}
                      required
                      fullWidth
                      margin="normal"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group col-md-1">
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
                  <div className="form-group col-md-3">
                    <label htmlFor="relationship">Relationship to Patient:</label>
                    <TextField
                      type="text"
                      id="relationship"
                      name="relationship"
                      value={formData.relationship}
                      onChange={handleFormChange}
                      required
                      fullWidth
                      margin="normal"
                    />
                  </div>
                  <div className="form-group col-md-4">
                    <label htmlFor="contact">Contact Number:</label>
                    <TextField
                      type="text"
                      id="contact"
                      name="contact"
                      value={formData.contact}
                      onChange={handleFormChange}
                      required
                      fullWidth
                      margin="normal"
                    />
                  </div>
                  <div className="form-group col-md-4">
                    <label htmlFor="email">Email Address:</label>
                    <TextField
                      type="text"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleFormChange}
                      required
                      fullWidth
                      margin="normal"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group col-md-6">
                    <label htmlFor="init">Initial Screening:</label>
                    <TextField
                      type="date"
                      id="init"
                      name="init"
                      value={formData.init}
                      onChange={handleFormChange}
                      required
                      fullWidth
                      margin="normal"
                    />
                  </div>
                  <div className="form-group col-md-6">
                    <label htmlFor="ff">FF-up:</label>
                    <TextField
                      type="date"
                      id="ff"
                      name="ff"
                      value={formData.ff}
                      onChange={handleFormChange}
                      required
                      fullWidth
                      margin="normal"
                    />
                  </div>
                </div>
                <div className="form-group mt-3">
                  <label htmlFor="remarks">Remarks (TB/TPT Case No.)</label>
                  <TextField
                    id="remarks"
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleFormChange}
                    required
                    fullWidth
                    margin="normal"
                  />
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

export default Contacts;