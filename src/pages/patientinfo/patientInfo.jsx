import React, { useState, useEffect } from 'react';
import { Box, Typography, useTheme, Button, TextField, InputAdornment,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, getDocs, getDoc, deleteDoc, doc } from "firebase/firestore";
import { db, auth } from '../../firebase.config';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PageviewIcon from '@mui/icons-material/Pageview';


const PatientInfo = () => {

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate(); 

  // Delete Dialogs
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [currentUser, loading] = useAuthState(auth);
  const [userRole, setUserRole] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  
  const handleAddNewPatient = () => {
    navigate("/patientgenform");
  };

  const handleClickDelete = (id) => {
    // Set the id to be deleted and open the dialog
    setDeleteId(id);
    setOpenDeleteDialog(true);
  };
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };
  

  const handleDelete = async () => {
    handleCloseDeleteDialog();
    if (deleteId) {
      try {
        await deleteDoc(doc(db, "patientsinfo", deleteId));
        setPatientsData(patientsData.filter((item) => item.id !== deleteId));
      } catch (error) {
        console.error("Error deleting patient: ", error);
      }
    }
  };
  
  
  const handleEdit = (id) => {
    // Navigate to the edit page or open an edit modal
    navigate(`/patientedit/${id}`);
  };
  
  const handleViewDetails = (id) => {
    // Navigate to the details page
    navigate(`/patientinfo/${id}`);
  };

    const [patientsData, setPatientsData] = useState([]);

    // New state for search text
    const [searchText, setSearchText] = useState('');

    // Function to handle the search input change
    const handleSearchChange = (event) => {
      setSearchText(event.target.value);
    };

  
    // Generate filtered rows based on search text
    const filteredRows = searchText
      ? patientsData.filter((row) => {
          // Check if fullName exists and is a string before calling toLowerCase
          return row.fullName && typeof row.fullName === 'string' && row.fullName.toLowerCase().includes(searchText.toLowerCase());
        })
      : patientsData;

      useEffect(() => {
        // This useEffect is for fetching patient data
        const fetchData = async () => {
          try {
            const querySnapshot = await getDocs(collection(db, "patientsinfo"));
            let data = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            // Sort by dateAdded in ascending order
            data.sort((a, b) => {
              const dateA = new Date(a.dateAdded);
              const dateB = new Date(b.dateAdded);
              return dateA - dateB;
            });
            setPatientsData(data);
          } catch (error) {
            console.error("Error fetching patient data: ", error);
          }
        };
        fetchData();
      }, []); 
      
      useEffect(() => {
        if (currentUser && !loading) {
          const userRef = doc(db, 'users', currentUser.uid);
          getDoc(userRef).then((docSnap) => {
            if (docSnap.exists()) {
              setUserRole(docSnap.data().role); // Set the user role in state
            }
          });
        }
      }, [currentUser, loading]);

      // Function to determine if the user can edit or delete
      const canEditOrDelete = () => {
        return ['Lab Aide', 'Admin'].includes(userRole);
      };
  const columns = [
    {
      field: 'caseNumber',
      headerName: 'Case Number',
      flex: 1,
    },
    {
      field: 'fullName', 
      headerName: 'Full Name',
      flex: 1,
    },
    {
      field: 'caseStatus',
      headerName: 'Case Status',
      flex: 1,
      renderCell: (params) => (
        <Typography
          style={{
            color: params.value === 'Closed' ? 'lightcoral' : 'lightgreen', 
          }}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'dateAdded',
      headerName: 'Date Added',
      flex: 1,
      // Add a custom formatter if necessary to format the date
      valueFormatter: (params) => {
        const valueFormatted = new Date(params.value).toLocaleDateString('en-US', { timeZone: 'Asia/Manila' });
        return valueFormatted;
      },
    },
    {
      field: 'action',
      headerName: 'Action',
      renderCell: (params) => (
        <Box display="flex" justifyContent="center">
          <Button
            startIcon={<PageviewIcon />}
            onClick={() => handleViewDetails(params.id)}
            variant="contained"
            color="primary"
            style={{ marginRight: 8 }}
          >
            View
          </Button>
          {canEditOrDelete(userRole) && (
            <>
              <Button
                startIcon={<EditIcon />}
                onClick={() => handleEdit(params.id)}
                variant="contained"
                color="secondary"
                style={{ marginRight: 8 }}
              >
                Edit
              </Button>
              <Button
                startIcon={<DeleteIcon />}
                onClick={() => handleClickDelete(params.id)}
                variant="contained"
                color="error"
              >
                Delete
              </Button>
            </>
          )}
        </Box>
      ),
      width: 300,
    },
  ];
  columns.forEach(column => {
    if(column.field === 'caseStatus') {
      column.sortable = true;
    }
  });

 return (
  <Box m="20px">
      <Header title="Patient Information" subtitle="Managing patient data" />
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center', // Align items vertically
        p: 2,
      }}>
        <TextField 
          placeholder="Search Patients" 
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
          onClick={handleAddNewPatient}
          style={{ 
            backgroundColor: canEditOrDelete(userRole) ? colors.greenAccent[600] : 'gray',
            color: colors.grey[100],
            height: '50px',
          }}
          disabled={!canEditOrDelete(userRole)}
        >
          Add New Patient
        </Button>
      </Box>
      <Box 
      sx={{
          width: 'auto',
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
          '& .MuiCheckbox-root': {
            color: colors.greenAccent[200],
          },
          '& .MuiDataGrid-toolbarContainer': {
            color: colors.grey[100],
          },
        }}>
        <DataGrid
          rows={filteredRows}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[5, 10, 20]}
          disableSelectionOnClick
          sortingMode="client"
        />

        
        {/* Delete Confirmation Dialog */}
        <Dialog
          open={openDeleteDialog}
          onClose={handleCloseDeleteDialog}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title" style={{ color: colors.greenAccent[600], fontSize: '1.5rem' }}>
            Confirm Deletion
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description" style={{ color: colors.grey[100] }}>
              Are you sure you want to delete this patient? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions style={{ justifyContent: 'center', padding: theme.spacing(3) }}>
            <Button onClick={handleCloseDeleteDialog} style={{ color: colors.grey[100], borderColor: colors.greenAccent[500], marginRight: theme.spacing(1) }}>
              Cancel
            </Button>
            <Button onClick={handleDelete} style={{ backgroundColor: colors.greenAccent[600], color: colors.grey[100] }} autoFocus>
              Delete
            </Button>
          </DialogActions>
        </Dialog>

      </Box>
    </Box>
  );
};

export default PatientInfo;