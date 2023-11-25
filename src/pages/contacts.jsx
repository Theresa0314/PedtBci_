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
import { Box, InputAdornment, DialogTitle, DialogContentText, DialogActions } from '@mui/material';
import { GridToolbar, DataGrid } from '@mui/x-data-grid';
import { tokens } from '../theme'; // Import your theme tokens from your theme file
import Header from '../components/Header';
import { db } from '../firebase.config'; // Firebase configuration
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
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

  const [searchText, setSearchText] = useState('');

  const [openAddForm, setOpenAddForm] = useState(false);

  const handleCloseAddForm = () => setOpenAddForm(false); 
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  const handleSearchChange = (event) => {
    setSearchText(event.target.value);
  }; 

  const [isAddContactDisabled, setIsAddContactDisabled] = useState(false);

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
    setOpenAddForm(true);
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
    setOpenAddForm(false);

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
    const selectedRow = tableData.find((row) => row.id === id);
  
    if (selectedRow) {
      setFormData({
        id: selectedRow.id,
        firstName: selectedRow.firstName,
        middleName: selectedRow.middleName,
        lastName: selectedRow.lastName,
        birthday: selectedRow.birthday, // Keep the string format from Firebase
        gender: selectedRow.gender,
        relationship: selectedRow.relationship,
        contact: selectedRow.contact,
        email: selectedRow.email,
      });
  
      setOpenAddForm(true);
    } else {
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
                startIcon={<EditIcon />}
                onClick={() => handleEditClick(params.row.id)}
                variant="contained"
                color="secondary"
                size="small"
                style={{ marginRight: 8 }}
              >
                Edit
              </Button>
          
          <Button
            startIcon={<DeleteIcon />}
            variant="contained"
            color="error"
            onClick={() => handleDeleteClick(params.row.id)}
            size='small'
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
      <Header
          title="Contact Tracing"
          subtitle="List of Close Contacts of this Patient"
        />

    <Box m="20px">
    {/* Contacts tab content here */}
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        p: 2,
      }}
    >
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
      {/* Conditionally render the "Add Contact" button based on the user role */}
      {!isAddContactDisabled && (
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
          Add Close Contact
        </Button>
      )}
    </Box>
    {/* Modal for adding new contact */}
    <Dialog
      open={openAddForm}
      onClose={handleCloseAddForm}
      aria-labelledby="add-contact-modal-title"
      aria-describedby="add-contact-modal-description"
    >
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
        rows={tableData}
        columns={columns}
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
        <DialogTitle id="alert-dialog-title">{"Confirm Deletion"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this contact? This action cannot be undone.
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
    </ThemeProvider>
  );
};

export default Contacts;