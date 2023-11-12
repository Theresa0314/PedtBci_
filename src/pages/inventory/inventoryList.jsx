import React, { useState, useEffect } from 'react';
import { Box, Typography, useTheme, Button, Modal, TextField, InputAdornment, Grid } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import InvForm from "./inventoryForm"; 
import { Link } from 'react-router-dom';
import { collection, doc, getDocs, deleteDoc } from "firebase/firestore";
import { db } from '../../firebase.config';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import EditIcon from '@mui/icons-material/Edit';

const InvList = () => {

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '100%', // Use a percentage to make it responsive
    maxWidth: 1000, // You can also set a maxWidth
    bgcolor: 'background.paper',
    boxShadow: 20,
    p: 4,
    borderRadius: 2, // Optional: if you want rounded corners
  };
  
  const [open, setOpen] = useState(false);


  const handleAddNewMed = () => {
    setOpen(true);
  };

  const handleCloseForm = () => {
    setOpen(false);
  };

    const [medData, setmedData] = useState([]);

    const handleDelete = async (id) => {
      try {
        await deleteDoc(doc(db, "inventory", id));
        setmedData(medData.filter((item) => item.id !== id));
      } catch (err) {
        console.log(err);
      }
    };

    // New state for search text
    const [searchText, setSearchText] = useState('');

    // Function to handle the search input change
    const handleSearchChange = (event) => {
      setSearchText(event.target.value);
    };

    const handleUpdateMed = (newMed) => {
      setmedData((currentMeds) => {
        const updatedMeds = [...currentMeds, newMed];
        updatedMeds.sort((a, b) => {
          const dateA = new Date(a.dateAdded);
          const dateB = new Date(b.dateAdded);
          return dateA - dateB; // Ascending order
        });
        return updatedMeds;
      });
    };

    // Generate filtered rows based on search text
    const filteredRows = searchText
      ? medData.filter((row) => {
          // Check if name exists and is a string before calling toLowerCase
          return row.name && typeof row.name === 'string' && row.name.toLowerCase().includes(searchText.toLowerCase());
        })
      : medData;

      useEffect(() => {
        const fetchData = async () => {
          try {
            const querySnapshot = await getDocs(collection(db, "inventory"));
            let data = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            // Sort by dateAdded in ascending order
            data.sort((a, b) => {
              const dateA = new Date(a.dateAdded);
              const dateB = new Date(b.dateAdded);
              return dateA - dateB;
            });
            setmedData(data);
          } catch (error) {
            console.error("Error fetching drug data: ", error);
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
      field: 'name', // This should match the field name in your Firestore documents for the medicine's full name
      headerName: 'Name',
      flex: 1,
    },
    {
        field: 'acronym', 
        headerName: 'Acronym',
        flex: 1,
      },
      {
        field: 'increment', 
        headerName: 'Increment',
        flex: 1,
        renderCell: (params) => (
        <Box  display="flex" justifyContent="center">
        <Button 
              className = "increment"
                variant="contained"
                style={{backgroundColor: colors.greenAccent[600]}}
              >
                 <AddIcon />
        </Button>
      </Box>
        ),
      },
    {
      field: 'quantity',
      headerName: 'Quantity',
      flex: 1,
      renderCell: (params) => (
        <Typography  display="flex" justifyContent="center"
          style={{
            color: params.value === '0' ? colors.redAccent[400] : colors.greenAccent[400], 
          }}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'decrement', 
      headerName: 'Decrement',
      flex: 1,
      renderCell: (params) => (
      <Box  display="flex" justifyContent="center">
      <Button 
            className = "decrement"
              variant="contained"
              style={{backgroundColor: colors.redAccent[600]}}
            >
            <RemoveIcon />
      </Button>
    </Box>
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
          <Link to={`/inventoryList/${params.id}`} style={{ textDecoration: 'none' }}>
          <Button 
                className = "editButton"
                startIcon={<EditIcon />}
                variant="outlined"
                color="success"
                //  onClick={() => handleEdit(params.row.id)}
                >
                  EDIT
          </Button>
          </Link>
        </Box>
      ),
    },
    {
      field: 'delete', 
      headerName: '',
      flex: 1,
      renderCell: (params) => (
      <Box  display="flex" justifyContent="center">
          <Button 
                className = "deleteButton"
                startIcon={<DeleteIcon />}
                  variant="outlined"
                  color="error"
                  onClick={() => handleDelete(params.row.id)}
                >
                  DELETE
          </Button>
    </Box>
      ),
    },
  ];
  columns.forEach(column => {
    if(column.field === 'status') {
      column.sortable = true;
    }
  });

 return (
<Box sx={{ flexGrow: 1, height: '100%', p: 3 }}>
      <Header title="Clinical Inventory" subtitle="Managing medication data" />
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center', // Align items vertically
        p: 2,
      }}>
        <TextField 
          placeholder="Search Medicine" 
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
          onClick={handleAddNewMed}
          style={{ 
            backgroundColor: colors.greenAccent[600],
            color: colors.grey[100],
            height: '50px', // Adjust based on your theme's input height
            marginLeft: theme.spacing(2)
          }}
        >
          Add New Medicine
        </Button>
      </Box>
      
 {/* Modal for the invForm */}
      <Modal
        open={open}
        onClose={handleCloseForm}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
      <InvForm handleCloseForm={handleCloseForm} handleUpdateMed={handleUpdateMed} />

        </Box>
      </Modal>

      <Box sx={{
          height: 650, // Adjust based on your layout
          width: '100%',
          '& .MuiDataGrid-root': {
            border: `1px solid ${colors.primary[700]}`,
            color: colors.grey[100],
            backgroundColor: colors.primary[400], // Background color for the DataGrid
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
          rows={filteredRows} // Use filteredRows here
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[5, 10, 20]}
          disableSelectionOnClick
          sortingMode="client"
        />

      </Box>
    </Box>
  );
};

export default InvList;