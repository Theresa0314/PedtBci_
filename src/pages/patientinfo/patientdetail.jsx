import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { db } from '../../firebase.config';
import { doc, collection, getDoc, getDocs } from "firebase/firestore";
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Grid,
  Container,
  useTheme,
  Card,
  CardContent,
  Divider,
  Tab,
  Tabs,
  Button,
  TextField,
  InputAdornment,
} from "@mui/material";
import Header from "../../components/Header";
import { tokens } from "../../theme";
import { DataGrid } from "@mui/x-data-grid";
import SearchIcon from "@mui/icons-material/Search";

const PatientDetail = () => {
  const { caseNumber } = useParams();
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState(0);
  const [patientsData, setPatientsData] = useState([]);
  const [searchText, setSearchText] = useState("");

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [open, setOpen] = useState(false);

  const handleAddNewPatient = () => {
    setOpen(true);
  };

  const handleCloseForm = () => {
    setOpen(false);
  };

  // Function to handle the search input change
  const handleSearchChange = (event) => {
    setSearchText(event.target.value);
  };

  const handleUpdatePatients = (newPatient) => {
    setPatientsData((currentPatients) => {
      const updatedPatients = [...currentPatients, newPatient];
      updatedPatients.sort((a, b) => {
        const dateA = new Date(a.dateAdded);
        const dateB = new Date(b.dateAdded);
        return dateA - dateB; // Ascending order
      });
      return updatedPatients;
    });
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  useEffect(() => {
    const fetchPatientData = async () => {
      const docRef = doc(db, "patientsinfo", caseNumber);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setPatientData(docSnap.data());
      } else {
        console.log("No such document!");
      }
      setLoading(false);
    };

    fetchPatientData();
  }, [caseNumber]);

  const filteredRows = searchText
    ? patientsData.filter((row) => {
        // Check if fullName exists and is a string before calling toLowerCase
        return (
          row.fullName &&
          typeof row.fullName === "string" &&
          row.fullName.toLowerCase().includes(searchText.toLowerCase())
        );
      })
    : patientsData;

  // Fetch cases db
  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "cases"));
        let data = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));

        // Filter data based on the fullName value (e.g., "Chuck Bass")
        const filteredData = data.filter(
          (patient) => patient.fullName === patientData.fullName
        );

        // Sort by dateAdded in ascending order
        filteredData.sort((a, b) => {
          const dateA = new Date(a.dateAdded);
          const dateB = new Date(b.dateAdded);
          return dateA - dateB;
        });

        setPatientsData(filteredData);
      } catch (error) {
        console.error("Error fetching patient data: ", error);
      }
    };

    if (patientData) {
      fetchData();
    }
  }, [patientData]);

  const columns = [
    {
      field: "caseNumber",
      headerName: "Case Number",
      flex: 1,
    },
    {
      field: "fullName", // This should match the field name in your Firestore documents for the patient's full name
      headerName: "Full Name",
      flex: 1,
    },
    {
      field: "caseStatus",
      headerName: "Case Status",
      flex: 1,
      renderCell: (params) => (
        <Typography
          style={{
            color: params.value === "Closed" ? "lightcoral" : "lightgreen",
          }}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: "dateAdded",
      headerName: "Date Added",
      flex: 1,
      // Add a custom formatter if necessary to format the date
      valueFormatter: (params) => {
        const valueFormatted = new Date(params.value).toLocaleDateString(
          "en-US",
          { timeZone: "Asia/Manila" }
        );

        return valueFormatted;
      },
    },
    {
      field: "action",
      headerName: "Action",
      flex: 1,
      renderCell: (params) => (
        <Box display="flex" justifyContent="center">
          <Link
            to={{
              pathname: `/patient_info/${caseNumber}/case/${params.id}`,
              state: { patientData: params.row }, // Pass the patientData as state
            }}
            style={{ textDecoration: "none" }}
          >
            <Button
              variant="contained"
              style={{
                backgroundColor: colors.greenAccent[600],
                color: colors.grey[100],
              }}
            >
              More Details
            </Button>
          </Link>
        </Box>
      ),
    },
  ];
  columns.forEach((column) => {
    if (column.field === "caseStatus") {
      column.sortable = true;
    }
  });

  if (loading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="flex-start"
        alignItems="flex-start"
        height="100vh"
        pl={1}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box padding={3} bgcolor="background.default" color="text.primary">
      <Header title="Patient Information" subtitle="Managing patient data" />
      <Tabs
        value={currentTab}
        onChange={handleTabChange}
        indicatorColor="secondary"
        textColor="inherit"
        fixed
      >
        <Tab label="Patient Profile" />
        <Tab label="Cases" />
      </Tabs>
      {currentTab === 0 && patientData && (
        <Container
          component={Paper}
          elevation={3}
          sx={{
            padding: theme.spacing(3),
            marginTop: theme.spacing(3),
            backgroundColor: colors.primary[400],
            maxWidth: "none",
          }}
        >
          {/* Personal Information */}
          <Card
            raised
            sx={{
              marginBottom: theme.spacing(4),
              backgroundColor: colors.primary[400],
            }}
          >
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                component="div"
                sx={{
                  fontWeight: "bold",
                  color: colors.greenAccent[500],
                  fontSize: "1.25rem",
                }}
              >
                Personal Information
              </Typography>
              <Divider
                sx={{
                  marginBottom: theme.spacing(2),
                  bgcolor: colors.grey[500],
                }}
              />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography
                    variant="body1"
                    sx={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}
                  >
                    <strong>Full Name:</strong> {patientData.fullName}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}
                  >
                    <strong>Alias:</strong> {patientData.alias || "N/A"}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}
                  >
                    <strong>Birthdate:</strong>{" "}
                    {new Date(patientData.birthdate).toLocaleDateString()}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}
                  >
                    <strong>Gender:</strong> {patientData.gender}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography
                    variant="body1"
                    sx={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}
                  >
                    <strong>Height:</strong> {patientData.height} cm
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}
                  >
                    <strong>Weight:</strong> {patientData.weight} kg
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}
                  >
                    <strong>Address:</strong>{" "}
                    {`${patientData.houseNameBlockStreet}, ${patientData.barangay}, ${patientData.city}, ${patientData.province}`}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/*Contact Information */}
          <Card
            raised
            sx={{
              marginBottom: theme.spacing(4),
              backgroundColor: colors.primary[400],
            }}
          >
            <CardContent>
              <Typography
                variant="h5"
                gutterBottom
                sx={{
                  color: colors.greenAccent[500],
                  fontWeight: "bold",
                  fontSize: "1.25rem",
                }}
              >
                Contact Information
              </Typography>
              <Divider
                sx={{
                  marginBottom: theme.spacing(2),
                  bgcolor: colors.grey[500],
                }}
              />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography
                    variant="body1"
                    sx={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}
                  >
                    <strong>Parent/Guardian Name:</strong>{" "}
                    {patientData.parentName}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}
                  >
                    <strong>Parent/Guardian Email:</strong>{" "}
                    {patientData.parentEmail}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}
                  >
                    <strong>Secondary Contact Name:</strong>{" "}
                    {patientData.secondaryContactName}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}
                  >
                    <strong>Emergency Contact Name:</strong>{" "}
                    {patientData.emergencyContactName}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography
                    variant="body1"
                    sx={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}
                  >
                    <strong>Relationship to Patient:</strong>{" "}
                    {patientData.relationshipToPatient}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}
                  >
                    <strong>Parent/Guardian Contact No.:</strong>{" "}
                    {patientData.parentContactNumber}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}
                  >
                    <strong>Secondary Contact Number:</strong>{" "}
                    {patientData.secondaryContactNumber}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}
                  >
                    <strong>Emergency Contact Number:</strong>{" "}
                    {patientData.emergencyContactNumber}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Medical Information */}
          <Card
            raised
            sx={{
              marginBottom: theme.spacing(4),
              backgroundColor: colors.primary[400],
            }}
          >
            <CardContent>
              <Typography
                variant="h5"
                gutterBottom
                sx={{
                  color: colors.greenAccent[500],
                  fontWeight: "bold",
                  fontSize: "1.25rem",
                }}
              >
                Medical Information
              </Typography>
              <Divider
                sx={{
                  marginBottom: theme.spacing(2),
                  bgcolor: colors.grey[500],
                }}
              />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Typography
                    variant="body1"
                    sx={{ fontSize: "1rem", marginBottom: "0.5rem" }}
                  >
                    <strong>Annual chest x-ray available:</strong>{" "}
                    {patientData.chestXrayAvailable === "yes" ? "Yes" : "No"}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography
                    variant="body1"
                    sx={{ fontSize: "1rem", marginBottom: "0.5rem" }}
                  >
                    <strong>
                      History of TB drug treatment (of the child):
                    </strong>{" "}
                    {patientData.tbDrugHistory === "yes" ? "Yes" : "No"}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography
                    variant="body1"
                    sx={{ fontSize: "1rem", marginBottom: "0.5rem" }}
                  >
                    <strong>Experiencing symptoms in the past 2 weeks:</strong>{" "}
                    {patientData.symptomsLastTwoWeeks === "yes" ? "Yes" : "No"}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Container>
      )}
      {currentTab === 1 && (
        <Box mt={3}>
          {/* Your Cases tab content here */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center", // Align items vertically
              pl: 2,
              pb: 2,
            }}
          >
            <TextField
              placeholder="Search Patients"
              variant="outlined"
              value={searchText}
              onChange={handleSearchChange}
              sx={{
                width: "100%",
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
            <Button
              variant="contained"
              onClick={handleAddNewPatient}
              style={{
                backgroundColor: colors.greenAccent[600],
                color: colors.grey[100],
                width: "125px",
                height: "50px", // Adjust based on your theme's input height
                marginLeft: theme.spacing(2),
              }}
            >
              Add New Case
            </Button>
          </Box>
          <Box
            sx={{
              height: 650, // Adjust based on your layout
              width: "100%",
              "& .MuiDataGrid-root": {
                border: `1px solid ${colors.primary[700]}`,
                color: colors.grey[100],
                backgroundColor: colors.primary[400], // Background color for the DataGrid
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
              rows={filteredRows} // Use filteredRows here
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[5, 10, 20]}
              disableSelectionOnClick
              sortingMode="client"
            />
          </Box>
        </Box>
      )}
      {!patientData && currentTab === 0 && (
        <Typography variant="h6" sx={{ color: colors.redAccent[500] }}>
          No patient information available.
        </Typography>
      )}
    </Box>
  );
};

export default PatientDetail;