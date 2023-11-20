import React, { useState, useEffect } from 'react';
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from '../../theme';
import Header from "../../components/Header";
import { Link, useNavigate } from 'react-router-dom';
import { Box, Typography, useTheme, Button, TextField, InputAdornment, 
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
} from "@mui/material";
import { db } from '../../firebase.config';
import { collection, getDocs,  deleteDoc, doc  } from "firebase/firestore";
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PageviewIcon from '@mui/icons-material/Pageview';

const ReferralInfo = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate(); 
  const [referrals, setReferrals] = useState([]);



  const handleAddNewReferral = () => {
    navigate("/referralform");
  };


  // New state for search text
  const [searchText, setSearchText] = useState('');

  // Function to handle the search input change
  const handleSearchChange = (event) => {
    setSearchText(event.target.value);
  };

   // Function to view details of a referral
   const handleViewDetails = (id) => {
    navigate(`/referralinfo/${id}`);
  };

  // Function to edit a referral
  const handleEdit = (id) => {
    navigate(`/referraledit/${id}`);
  };

    // Delete Dialogs
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

  // Function to handle delete confirmation dialog
  const handleClickDelete = (id) => {
    setDeleteId(id);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  // Function to delete a referral
  const handleDelete = async () => {
    handleCloseDeleteDialog();
    if (deleteId) {
    try {
      await deleteDoc(doc(db, "referralform", deleteId));
      setReferrals(referrals.filter((item) => item.id !== deleteId));
      setOpenDeleteDialog(false);
    } catch (error) {
      console.error("Error deleting referral: ", error);
    }
  }
};

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Make sure to target the correct collection name here
        const querySnapshot = await getDocs(collection(db, "referralform"));
        let data = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        // Sort by dateAdded in ascending order if necessary
        data.sort((a, b) => {
          const dateA = new Date(a.dateAdded);
          const dateB = new Date(b.dateAdded);
          return dateA - dateB;
        });
        setReferrals(data);
      } catch (error) {
        console.error("Error fetching referral data: ", error);
      }
    };
  
    fetchData();
  }, []);
  

  const columns = [
    {
      field: 'caseNumber',
      headerName: 'Case Number',
      flex: 1,
    },
    {
      field: 'referringFacilityName',
      headerName: 'Referring Facility/Unit',
      flex: 1,
    },
    {
      field: 'caseStatus',
      headerName: 'Case Status',
      flex: 1,
      renderCell: (params) => {
        // Here you can add more logic to handle different statuses
        let color;
        switch (params.value) {
          case 'Closed':
            color = 'red';
            break;
          case 'Active':
            color = 'green';
            break;
          case 'Pending':
            color = 'orange';
            break;
          default:
            color = 'grey';
        }
        return (
          <Typography style={{ color: color }}>
            {params.value}
          </Typography>
        );
      }
    },
    
    {
      field: 'dateReferred',
      headerName: 'Date Referred',
      flex: 1,
      valueFormatter: (params) => {
        const valueFormatted = new Date(params.value).toLocaleDateString('en-US', { timeZone: 'Asia/Manila' });
        return valueFormatted;
      },
    },
    {
      field: 'action',
      headerName: 'Action',
      flex: 1,
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
        </Box>
      ),
      width: 300,
    },
  ];
  

  return (
    <Box m="20px">
    <Header title="Referral Information" subtitle="Managing referral data" />
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
       onClick={handleAddNewReferral}
        style={{ 
          backgroundColor: colors.greenAccent[600],
          color: colors.grey[100],
          height: '50px',
        }}
      >
        Add New Referral 
      </Button>
    </Box>
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
        <DataGrid
          rows={referrals}
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

export default ReferralInfo;
