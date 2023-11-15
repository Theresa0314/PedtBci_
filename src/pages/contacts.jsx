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
  Button,
  Dialog,
  DialogContent,
  Grid,
} from '@mui/material';
import { useTheme } from '@mui/material';
import { Box } from '@mui/material';
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
import { mockDataContacts } from '../data/mockData';
import { Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';


const Contacts = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [isAddFormOpen, setAddFormOpen] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    birthday: '',
    gender: '',
    relationship: '',
    contact: '',
    email: '',
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
        firstName: formData.firstName,
        middleName: formData.middleName,
        lastName: formData.lastName,
        birthday: formData.birthday,
        gender: formData.gender,
        relationship: formData.relationship,
        contact: formData.contact,
        email: formData.email,
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
      firstName: '',
      middleName: '',
      lastName: '',
      birthday: '',
      gender: '',
      relationship: '',
      contact: '',
      email: '',
    });
  };

  const handleEditClick = (id) => {
    // Find the data for the selected row based on its `id`
    const selectedRow = tableData.find((row) => row.id === id);
  
    // Check if the row exists
    if (selectedRow) {
      // Convert birthday to Firestore Timestamp, handle null case
      const formattedBirthday = selectedRow.birthday
        ? new Date(selectedRow.birthday.seconds * 1000).toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          })
        : null;
  
      // Update the form data with the selected row's values and set the ID
      setFormData({
        id: selectedRow.id, // Set the ID in formData
        firstName: selectedRow.firstName,
        middleName: selectedRow.middleName,
        lastName: selectedRow.lastName,
        birthday: formattedBirthday,
        gender: selectedRow.gender,
        relationship: selectedRow.relationship,
        contact: selectedRow.contact,
        email: selectedRow.email,
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
    const confirmDeletion = window.confirm("Are you sure you want to delete this contact?");
  
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
      valueGetter: (params) => {
        // Concatenate first, middle, and last names
        const { firstName, middleName, lastName } = params.row;
        return `${firstName} ${middleName} ${lastName}`;
      },
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
              Add Close Contact
            </Button>

            <DataGrid rows={tableData} columns={columns} components={{ Toolbar: GridToolbar }} />
          </Box>
        </Box>
        
        <Dialog open={isAddFormOpen} onClose={() => setAddFormOpen(false)}>
          <DialogContent>
            <div className="container mt-5">
            <div style={{ textAlign: 'center' }}>
              <h1> Pediatric TB - Contact Tracing Form</h1>
              </div>
              <form onSubmit={handleSubmit}>
                {/* Name Fields */}
                <div className="form-row">
                  <Typography variant="subtitle1">Full Name:</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <TextField
                        type="text"
                        id="firstName"
                        name="firstName"
                        label="First Name"
                        variant="outlined"
                        margin="dense"
                        fullWidth
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        required
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <TextField
                        type="text"
                        id="middleName"
                        name="middleName"
                        label="Middle Name"
                        variant="outlined"
                        margin="dense"
                        fullWidth
                        value={formData.middleName}
                        onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                        required
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <TextField
                        type="text"
                        id="lastName"
                        name="lastName"
                        label="Last Name"
                        variant="outlined"
                        margin="dense"
                        fullWidth
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        required
                      />
                    </Grid>
                  </Grid>
                </div>
                {/* Date of Birth, Gender, and Relationship to Patient Fields */}
                <div className="form-row">
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                    <Typography variant="subtitle12">Birthdate:</Typography>
                      <TextField
                        type="date"
                        id="birthday"
                        name="birthday"
                        variant="outlined"
                        margin="dense"
                        fullWidth
                        value={formData.birthday}
                        onChange={handleFormChange}
                        required
                      />
                    </Grid>
                    <Grid item xs={4}>
                    <Typography variant="subtitle3">Gender:</Typography>
                      <FormControl variant="outlined" fullWidth margin="dense">
                        <InputLabel id="gender-label"></InputLabel>
                        <Select
                          labelId="gender-label"
                          id="gender"
                          name="gender"
                          value={formData.gender}
                          onChange={handleFormChange}
                          required
                        >
                          <MenuItem value="">Choose...</MenuItem>
                          <MenuItem value="Male">Male</MenuItem>
                          <MenuItem value="Female">Female</MenuItem>
                          <MenuItem value="Other">Other</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={4}>
                    <Typography variant="subtitle4">Relationship to Patient:</Typography>
                      <TextField
                        type="text"
                        id="relationship"
                        name="relationship"
                        label="Relationship to Patient"
                        variant="outlined"
                        margin="dense"
                        fullWidth
                        value={formData.relationship}
                        onChange={handleFormChange}
                        required
                      />
                    </Grid>
                  </Grid>
                </div>
                {/* Contact Number and Email Address Fields */}
                <div className="form-row" style={{ marginTop: '20px' }}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                    <Typography variant="subtitle1=5">Contact Number:</Typography>
                      <TextField
                        type="text"
                        id="contact"
                        name="contact"
                        label="Contact Number"
                        variant="outlined"
                        margin="dense"
                        fullWidth
                        value={formData.contact}
                        onChange={handleFormChange}
                        required
                      />
                    </Grid>
                    <Grid item xs={6}>
                    <Typography variant="subtitle6">Email Address:</Typography>
                      <TextField
                        type="text"
                        id="email"
                        name="email"
                        label="Email Address"
                        variant="outlined"
                        margin="dense"
                        fullWidth
                        value={formData.email}
                        onChange={handleFormChange}
                        required
                      />
                    </Grid>
                  </Grid>
                </div>
                <div className="d-flex justify-content-center align-items-center mt-3">
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px'}}>
                    <Button type="submit" variant="contained" color="secondary">
                      Submit
                    </Button>
                  </div>
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