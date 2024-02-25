import React, { useState, useEffect } from "react";
import {
  DialogActions,
  Typography,
  TextField,
  Button,
  Box,
  InputAdornment,
  Dialog,
  DialogContent,
} from "@mui/material";
import { useTheme } from "@mui/material";
import { GridToolbar, DataGrid } from "@mui/x-data-grid";
import { tokens } from "../theme";
import Header from "../components/Header";
import { db, auth } from "../firebase.config";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PageviewIcon from "@mui/icons-material/Pageview";

const Inventory = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    loadTableData();
    fetchUserRole();
  }, []);

  // Fetch user role
  const fetchUserRole = async () => {
    if (auth.currentUser) {
      const userId = auth.currentUser.uid;
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setUserRole(userSnap.data().role);
      } else {
        console.error("User role not found");
      }
    } else {
      console.error("No user is currently signed in");
    }
  };

  // New state for search text
  const [searchText, setSearchText] = useState("");

  // Function to handle the search input change
  const handleSearchChange = (event) => {
    setSearchText(event.target.value);
  };

  const [isAddFormOpen, setAddFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: "", // Include ID for editing
    name: "",
    acronym: "",
    quantity: "",
    remarks: "",
  });
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    // Load data from Firebase when the component mounts
    loadTableData();
  }, []);

  const loadTableData = async () => {
    const inventoryCollection = collection(db, "inventory");
    const inventorySnapshot = await getDocs(inventoryCollection);
    const data = [];
    inventorySnapshot.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() });
    });
    setTableData(data);
  };

  const handleAddClick = () => {
    setAddFormOpen(true);
  };

  const handleCloseForm = () => {
    setAddFormOpen(false);
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
      try {
        // Update the document in the database
        await updateDoc(doc(db, "inventory", formData.id), formData);

        // Update the local table data
        setTableData((prevData) => {
          const updatedData = prevData.map((row) =>
            row.id === formData.id ? { ...row, ...formData } : row
          );
          return updatedData;
        });

        console.log(`Row with ID ${formData.id} updated in the database`);
      } catch (error) {
        console.error("Error updating document: ", error);
      }
    } else {
      const newData = {
        name: formData.name,
        acronym: formData.acronym,
        quantity: formData.quantity,
        remarks: formData.remarks,
      };

      // Save the data to Firebase
      try {
        const inventoryCollection = collection(db, "inventory");
        const docRef = await addDoc(inventoryCollection, newData);

        // Update the local table data
        setTableData([...tableData, { id: docRef.id, ...newData }]);

        console.log(`Row with ID ${docRef.id} added to the database`);
      } catch (error) {
        console.error("Error adding document: ", error);
      }
    }

    // Close the form
    setAddFormOpen(false);

    // Clear the form data
    setFormData({
      id: "",
      name: "",
      acronym: "",
      quantity: "",
      remarks: "",
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
        acronym: selectedRow.acronym,
        quantity: selectedRow.quantity,
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
    const confirmDeletion = window.confirm(
      "Are you sure you want to delete this row?"
    );

    if (confirmDeletion) {
      // Delete the data from the database
      try {
        setTableData(tableData.filter((row) => row.id !== id));
        // Use the `id` to delete the corresponding document in the database
        await deleteDoc(doc(db, "inventory", id));
        console.log(`Row with ID ${id} deleted from the database`);
      } catch (error) {
        console.error("Error deleting document: ", error);
      }
    } else {
      // Handle the case where the user canceled the deletion
      console.log(`Deletion of row with ID ${id} canceled`);
    }
  };

  // Utility function to check if the user can add, edit or delete
  const canModify = (role) => {
    return ["Lab Aide", "Medical Technologist", "Admin"].includes(role);
  };

  const columns = [
    {
      field: "id",
      headerName: "ID",
      flex: 2,
    },
    {
      field: "name",
      headerName: "Name",
      flex: 2,
    },
    {
      field: "acronym",
      headerName: "Acronym",
      headerAlign: "left",
      align: "left",
      flex: 2,
    },
    {
      field: "quantity",
      headerName: "Quantity",
      flex: 2,
      renderCell: (params) => (
        <Typography
          style={{
            color:
              params.value === "0"
                ? colors.redAccent[400]
                : colors.greenAccent[400],
          }}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: "remarks",
      headerName: "Remarks",
      flex: 2,
    },
    {
      field: "action",
      headerName: "Action",
      flex: 3,
      sortable: false,
      renderCell: (params) => {
        // Check if the user has permission to edit or delete
        const canEditDelete = canModify(userRole);

        return (
          <Box display="flex" justifyContent="center">
            {canEditDelete && (
              <>
                <Button
                  startIcon={<EditIcon />}
                  variant="contained"
                  color="secondary"
                  style={{ marginRight: 8 }}
                  onClick={() => handleEditClick(params.row.id)}
                >
                  Edit
                </Button>
                <Button
                  startIcon={<DeleteIcon />}
                  variant="contained"
                  color="error"
                  onClick={() => handleDeleteClick(params.row.id)}
                >
                  Delete
                </Button>
              </>
            )}
          </Box>
        );
      },
    },
  ];

  return (
    <Box m="20px">
      <Header
        title="Clinical Inventory"
        subtitle="Managing TB drug inventory data"
      />

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 2,
        }}
      >
        <TextField
          placeholder="Search Inventory"
          variant="outlined"
          value={searchText}
          onChange={handleSearchChange}
          sx={{
            width: 550,
            backgroundColor: colors.blueAccent[700],
            marginLeft: theme.spacing(-2),
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        {canModify(userRole) && (
          <Button
            variant="contained"
            onClick={handleAddClick}
            style={{
              backgroundColor: colors.greenAccent[600],
              color: colors.grey[100],
              height: "50px",
            }}
          >
            Add Data
          </Button>
        )}
      </Box>
      <Box
        sx={{
          width: "100%",
          height: "70vh", // Set the height to 70% of the viewport height or adjust as needed
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
          "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
            color: `${colors.grey[100]} !important`,
          },
        }}
      >
        <DataGrid
          rows={tableData}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[5, 10, 20]}
          disableSelectionOnClick
          sortingMode="client"
        />

        <Dialog
          open={isAddFormOpen}
          onClose={handleCloseForm}
          maxWidth="sm"
          fullWidth
        >
          <DialogContent>
            <Typography variant="h6" gutterBottom>
              Add New Inventory Item
            </Typography>
            <form onSubmit={handleSubmit}>
              <TextField
                required
                label="Name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                fullWidth
                margin="dense"
              />
              <TextField
                label="Acronym"
                type="text"
                name="acronym"
                value={formData.acronym}
                onChange={handleFormChange}
                fullWidth
                margin="dense"
              />
              <TextField
                required
                label="Quantity"
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleFormChange}
                fullWidth
                margin="dense"
                InputProps={{ inputProps: { min: 0 } }}
              />
              <TextField
                label="Remarks"
                type="text"
                name="remarks"
                value={formData.remarks}
                onChange={handleFormChange}
                fullWidth
                margin="dense"
                multiline
                rows={4}
              />
              <Box mt={2} display="flex" justifyContent="space-between">
                <Button
                  onClick={handleCloseForm}
                  style={{
                    color: colors.grey[100],
                    borderColor: colors.greenAccent[500],
                    marginRight: theme.spacing(1),
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  style={{
                    color: colors.grey[100],
                    borderColor: colors.greenAccent[500],
                    marginRight: theme.spacing(1),
                  }}
                >
                  Save
                </Button>
              </Box>
            </form>
          </DialogContent>
        </Dialog>
      </Box>
    </Box>
  );
};

export default Inventory;
