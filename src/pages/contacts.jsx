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
import { tokens } from '../theme'; 
import Header from '../components/Header';
import { db, auth } from '../firebase.config';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query, where, getDoc
} from 'firebase/firestore';


const Contacts = ({ caseId })=> {
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
    const loadTableData = async () => {
      // Create a query against the 'contactTracing' collection where 'caseId' matches the given caseId
      const q = query(collection(db, 'contactTracing'), where('caseId', '==', caseId));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTableData(data);
    };
  
    if (caseId) {
      loadTableData();
    }
  }, [caseId]);
  

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
    
    // Log the formData to check if all fields are correct before attempting to update
    console.log('Form data on submit:', formData);

    if (formData.id) {
      try {
        const contactRef = doc(db, 'contactTracing', formData.id);
        console.log('Attempting to update document with ID:', formData.id);
        
        const { caseId: omittedCaseId, caseNumber: omittedCaseNumber, ...updatedData } = formData;
        
        await updateDoc(contactRef, updatedData);
        setTableData(prev =>
          prev.map(row => (row.id === formData.id ? { ...row, ...updatedData } : row))
        );
        
        console.log(`Document with ID ${formData.id} updated`);
      } catch (error) {
        console.error('Error updating document:', error);
      }
    } else {
      // Adding a new contact
      try {
        const caseRef = doc(db, 'cases', caseId);
        const caseSnap = await getDoc(caseRef);
        
        if (caseSnap.exists()) {
          const caseData = caseSnap.data();
          
          const newData = {
            ...formData,
            caseId: caseId,
            caseNumber: caseData.caseNumber,
          };
          
          const docRef = await addDoc(collection(db, 'contactTracing'), newData);
          setTableData([...tableData, { id: docRef.id, ...newData }]);
          console.log(`New document added with ID: ${docRef.id}`);
        } else {
          console.error('No such case!');
        }
      } catch (error) {
        console.error('Error adding new document:', error);
      }
    }
    
    // Close the form and reset form data
    setAddFormOpen(false);
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
      // Check if birthday is a Firestore Timestamp
      let formattedBirthday;
      if (selectedRow.birthday && typeof selectedRow.birthday.toDate === 'function') {
        formattedBirthday = selectedRow.birthday.toDate().toISOString().substring(0, 10); // Convert to 'YYYY-MM-DD' format
      } else if (selectedRow.birthday) {
        // If it's already a Date object or a string, use it as is or convert to Date object
        const date = new Date(selectedRow.birthday);
        formattedBirthday = isNaN(date) ? '' : date.toISOString().substring(0, 10);
      } else {
        formattedBirthday = ''; // If no birthday is set, use an empty string
      }
  
      setFormData({
        id: selectedRow.id,
        firstName: selectedRow.firstName,
        middleName: selectedRow.middleName,
        lastName: selectedRow.lastName,
        birthday: formattedBirthday,
        gender: selectedRow.gender,
        relationship: selectedRow.relationship,
        contact: selectedRow.contact,
        email: selectedRow.email,
      });
  
      setAddFormOpen(true);
    } else {
      console.error(`Row with ID ${id} not found`);
    }
  };
  
  
    const [userRole, setUserRole] = useState(null); // State to store user role

    // Fetch user role from Firebase when the component mounts
    useEffect(() => {
      const fetchUserRole = async () => {
        // Assuming 'auth' is your authentication object and it has a current user
        const userId = auth.currentUser.uid;
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserRole(userData.role); // Set user role from user data
        }
      };

      fetchUserRole();
    }, []);

    // Check if the user has permission to modify contacts
    const canModifyContacts = userRole === 'Admin' || userRole === 'Lab Aide';

  

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
      flex: 1,
      valueGetter: (params) => {
        // Convert the date string to a Date object
        return new Date(params.row.birthday);
      },
    },
    {
      field: 'gender',
      headerName: 'Gender',
      flex: 1,
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
      renderCell: (params) => (
        <div>
          {canModifyContacts && (
            <>
              <Button
                startIcon={<EditIcon />}
                variant="contained"
                color="secondary"
                size="small"
                style={{ marginRight: 8 }}
                onClick={() => handleEditClick(params.row.id)}
              >
                Edit
              </Button>
              <Button
                startIcon={<DeleteIcon />}
                variant="contained"
                color="error"
                size="small"
                onClick={() => handleDeleteClick(params.row.id)}
              >
                Delete
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center', // Align items vertically
      p: 2,
    }}>


<Box sx={{
        height: 400,
        width: '100%',
        '& .MuiDataGrid-root': {
          border: `1px solid ${colors.primary[700]}`,
          color: colors.grey[100],
          backgroundColor: colors.primary[400],
        },
        '& .MuiDataGrid-columnHeaders': {
          backgroundColor: colors.blueAccent[700],
          color: colors.grey[100],
        },
        '& .MuiDataGrid-cell': {
          borderBottom: `1px solid ${colors.primary[700]}`,
        },
        '& .MuiDataGrid-footerContainer': {
          borderTop: `1px solid ${colors.primary[700]}`,
          backgroundColor: colors.blueAccent[700],
          color: colors.grey[100],
        },
      }}>
              {
                canModifyContacts && (
                  <Button
                    variant="contained"
                    onClick={handleAddClick}
                    
                    style={{
                      backgroundColor: colors.greenAccent[600],
                      color: colors.grey[100],
           
                      marginLeft: theme.spacing(2),
                    }}
                  >
                    Add Contact
                  </Button>
                )
              }

            <DataGrid   
            rows={tableData.filter(row => row.caseId === caseId)}
            columns={columns} 
            components={{ Toolbar: GridToolbar }} />
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
      </Box>
    </ThemeProvider>
  );
};

export default Contacts;