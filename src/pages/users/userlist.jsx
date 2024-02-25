import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  useTheme,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import moment from "moment";
import { db, auth } from "../../firebase.config";
import { useAuthState } from "react-firebase-hooks/auth";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";

const UserList = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const [currentUser, loading, error] = useAuthState(auth);

  const [users, setUsers] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUserRole, setSelectedUserRole] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  // Dropdown choices for roles
  const roleOptions = [
    "Doctor",
    "Nurse",
    "Medical Technologist",
    "Lab Aide",
    "Parent",
  ];

  useEffect(() => {
    if (loading) {
      return;
    }
    if (error) {
      console.error("Error loading user:", error);
      return;
    }
    if (currentUser) {
      const userRef = doc(db, "users", currentUser.uid);
      getDoc(userRef).then((docSnap) => {
        if (docSnap.exists() && docSnap.data().role === "Admin") {
          setIsAdmin(true);
          // Fetch the users as admin is verified
          fetchUsers();
        } else {
          // If not admin or if the document does not exist, sign out and redirect to login
          signOut(auth)
            .then(() => {
              navigate("/login");
            })
            .catch((error) => {
              console.error("Logout failed", error);
            });
        }
      });
    } else if (!loading) {
      // If there is no current user and it's not loading, redirect to login
      navigate("/login");
    }
  }, [currentUser, loading, navigate, error]);

  const fetchUsers = async () => {
    const querySnapshot = await getDocs(collection(db, "users"));
    const usersData = querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));
    setUsers(usersData);
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (!isAdmin) {
    return <Box>Not authorized to view this page</Box>;
  }

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchText(value.toLowerCase());
  };

  const handleRoleChange = (event) => {
    setSelectedUserRole(event.target.value);
  };

  // Function to open the role editing dialog
  const handleEditRolesClick = (userId, role) => {
    setSelectedUserId(userId);
    setSelectedUserRole(role);
    setIsRoleDialogOpen(true);
  };

  // Function to close the role editing dialog
  const handleCloseRoleDialog = () => {
    setIsRoleDialogOpen(false);
    setSelectedUserId(null);
    setSelectedUserRole("");
  };

  // Function to save the new role to Firestore
  const handleSaveRole = async () => {
    if (selectedUserId) {
      const userDocRef = doc(db, "users", selectedUserId);
      await updateDoc(userDocRef, { role: selectedUserRole });

      // Re-fetch users or update the local state to reflect the changes
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === selectedUserId
            ? { ...user, role: selectedUserRole }
            : user
        )
      );
      handleCloseRoleDialog();
    }
  };

  const filteredRows = searchText
    ? users.filter(
        (user) =>
          user.fullName.toLowerCase().includes(searchText) ||
          user.email.toLowerCase().includes(searchText)
      )
    : users;

  const formatDate = (value) => {
    return moment(value.toDate()).format("MM/DD/YYYY");
  };

  const columns = [
    { field: "fullName", headerName: "Full Name", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    { field: "role", headerName: "Role", flex: 1 },
    {
      field: "dateAdded",
      headerName: "Date Added",
      flex: 1,
      valueFormatter: (params) => formatDate(params.value),
    },
    {
      field: "action",
      headerName: "Action",
      renderCell: (params) => (
        <Box display="flex" justifyContent="center">
          <Button
            startIcon={<EditIcon />}
            onClick={() => handleEditRolesClick(params.id, params.row.role)}
            variant="contained"
            color="secondary"
            style={{ marginRight: theme.spacing(1) }}
          >
            Edit Roles
          </Button>
        </Box>
      ),
      flex: 1,
    },
  ];

  return (
    <Box m="20px">
      <Header title="User List" subtitle="Managing user data" />
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 2,
        }}
      >
        <TextField
          placeholder="Search Users"
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
        }}
      >
        <DataGrid
          rows={filteredRows}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[5, 10, 20]}
          disableSelectionOnClick
        />

        <Dialog open={isRoleDialogOpen} onClose={handleCloseRoleDialog}>
          <DialogTitle>Edit User Role</DialogTitle>
          <DialogContent>
            <FormControl fullWidth>
              <InputLabel id="role-select-label">Role</InputLabel>
              <Select
                labelId="role-select-label"
                id="role-select"
                value={selectedUserRole}
                label="Role"
                onChange={handleRoleChange}
              >
                {roleOptions.map((role) => (
                  <MenuItem key={role} value={role}>
                    {role}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleCloseRoleDialog}
              variant="outlined"
              sx={{
                color: colors.grey[100],
                borderColor: colors.grey[700],
                "&:hover": {
                  borderColor: colors.grey[500],
                  backgroundColor: "transparent",
                },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveRole}
              variant="contained"
              sx={{
                backgroundColor: colors.greenAccent[600],
                color: colors.grey[100],
                "&:hover": {
                  backgroundColor: colors.greenAccent[700],
                },
              }}
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default UserList;
