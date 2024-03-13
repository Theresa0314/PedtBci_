import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db, auth } from '../../firebase.config';
import PageviewIcon from '@mui/icons-material/Pageview';
import { doc, collection, getDoc, getDocs, addDoc } from "firebase/firestore";
import { useAuthState } from 'react-firebase-hooks/auth';
import {  Box,  Typography,  CircularProgress,  Paper,  Grid,  Container,  useTheme, Card,  CardContent,  Divider,  Tab,  Tabs,  Button,  TextField,  InputAdornment} from "@mui/material";
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


  const [currentUser] = useAuthState(auth); // Use the hook to get the current user
  const [userRole, setUserRole] = useState(''); // Define setUserRole to update user's role
  const [isAddCaseDisabled, setIsAddCaseDisabled] = useState(false);
    // State to determine if the user is a parent
    const [isParent, setIsParent] = useState(false);

  const navigate = useNavigate();

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // Function to directly add a new case
  const handleAddNewCaseDirectly = async () => {
    const newCaseData = {
      status: 'Ongoing', // Default status for new cases
      startDate: new Date().toISOString().slice(0, 10), // Start date as today
      endDate: '', // End date is initially blank
      caseStatus: 'Open', // Default case status
      caseNumber: patientData.caseNumber, // Use the same caseNumber as the patient
      fullName: patientData.fullName,
    };

    try {
      const docRef = await addDoc(collection(db, "cases"), newCaseData);
      // Add the new case to the local state to update the table
      setPatientsData(prevData => [
        ...prevData,
        { ...newCaseData, id: docRef.id, dateAdded: new Date().toISOString() }, // Add new case to the state
      ]);
    } catch (error) {
      console.error("Error adding new case: ", error);
    }
  };

  // Function to handle the search input change
  const handleSearchChange = (event) => {
    setSearchText(event.target.value);
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

  // Fetch the user's role
  useEffect(() => {
    if (currentUser) {
      const userRef = doc(db, 'users', currentUser.uid);
      getDoc(userRef).then((docSnap) => {
        if (docSnap.exists()) {
          const role = docSnap.data().role;
          setUserRole(role);
          setIsParent(role === 'Parent');
        }
      });
    }
  }, [currentUser]);

  // Check if there's an open case and if the user is not a parent
  useEffect(() => {
    const openCaseExists = patientsData.some(caseInfo => caseInfo.caseStatus === 'Open');
    setIsAddCaseDisabled(openCaseExists);
  }, [patientsData]);

  const columns = [
    { field: 'caseNumber', headerName: 'Case Number', flex: 1 },
    { field: 'fullName', headerName: 'Full Name', flex: 1 },
    { field: 'status', headerName: 'Status', flex: 1 },
    { 
      field: 'startDate', 
      headerName: 'Start Date', 
      flex: 1,
      valueFormatter: (params) => params.value ? new Date(params.value).toLocaleDateString("en-US") : ""
    },
    { 
      field: 'endDate', 
      headerName: 'End Date', 
      flex: 1,
      valueFormatter: (params) => params.value ? new Date(params.value).toLocaleDateString("en-US") : ""
    },
    { field: 'caseStatus', headerName: 'Case Status', flex: 1 },
    {
      field: 'action',
      headerName: 'Action',
      sortable: false,
      flex: 1,
      renderCell: (params) => (
        <Button
          variant="contained"
          color="primary"
          style={{ marginRight: 8 }}
          startIcon={<PageviewIcon />}
          onClick={() => navigate(`/case/${params.id}`)}
        >
          View
        </Button>
      )
    }
  ];
  
  columns.forEach((column) => {
    if (column.field === "caseStatus") {
      column.sortable = true;
    }
  });
  
    // Function to calculate age from date of birth
    const calculateAge = (dob) => {
      const birthDate = new Date(dob);
      const difference = Date.now() - birthDate.getTime();
      const ageDate = new Date(difference);
      return Math.abs(ageDate.getUTCFullYear() - 1970);
    };

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
        <Tab label="Referral Report" />
        <Tab label="Cases" />
      </Tabs>

    {/* Patient Profile Tab */}
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

    {/* Referral Form */}
    {currentTab === 1 && patientData && (
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
                sx={{fontWeight: "bold", color: colors.greenAccent[500],fontSize: "1.25rem",}}
              > NTP Referral Form
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
                    sx={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}
                  >
                    <strong>TB/TPT Case Number:</strong> {patientData.caseNumber}
                  </Typography>
              </Grid>
              <Grid item xs={12} sm={5}>
                  <Typography variant="body1" sx={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>
                    <strong>To:</strong> {patientData.receivingFacilityName}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Typography variant="body1" sx={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>
                    <strong>Date Referred:</strong> {new Date(patientData.dateAdded).toLocaleDateString()}
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ bgcolor: colors.grey[500], my: 2 }} />
            {/* Referring Facility */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}><strong>Name of Referring Facility:</strong> {patientData.referringFacilityName}</Typography>
                  <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}><strong>Email:</strong> {patientData.referringFacilityEmail}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}><strong>Contact Number:</strong> {patientData.referringFacilityContactNumber}</Typography>
                  <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}><strong>Address:</strong> {patientData.referringFacilityAddress}</Typography>
                </Grid>
              </Grid>
              <Divider sx={{ bgcolor: colors.grey[500], my: 2 }} />
            {/* Patient information */}
            <Grid container spacing={2}>
          <Grid item xs={12} sm={5}>
            <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}><strong>Patient's Full Name:</strong> {patientData.fullName}</Typography>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}><strong>Age:</strong> {calculateAge(patientData.birthdate)} </Typography>
          </Grid>  
          <Grid item xs={12} sm={2}>
            <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}><strong>Sex:</strong> {patientData.gender}</Typography>
            </Grid>
          <Grid item xs={12} sm={2}>
          <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}><strong>Weight:</strong> {patientData.weight} kg</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
              <strong>Address:</strong> {`${patientData.houseNameBlockStreet}, ${patientData.barangay}, ${patientData.city}, ${patientData.province}`}
            </Typography>
          </Grid>
          </Grid>
          <Divider sx={{ bgcolor: colors.grey[500], my: 2 }} />
          {/* Reason for Referral */}
 {/* Always show the main reason */}
 <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
            <strong>Reason for Referral:</strong> {patientData.reasonForReferral}
            </Typography>

            {/* Additional details based on the main reason */}
            {patientData.reasonForReferral === 'For Screening' && patientData.subReason && (
            <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                <strong>Screening Details:</strong> {patientData.subReason}
            </Typography>
            )}

            {patientData.reasonForReferral === 'For Continuation of Treatment/Decentralize' && (
            <>
                {patientData.bacteriologicalStatus && (
                <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                    <strong>Bacteriological Status:</strong> {patientData.bacteriologicalStatus}
                </Typography>
                )}
                {patientData.anatomicalSite && (
                <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                    <strong>Anatomical Site:</strong> {patientData.anatomicalSite}
                </Typography>
                )}
                {patientData.drugSusceptibility && (
                <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                    <strong>Drug Susceptibility:</strong> {patientData.drugSusceptibility}
                </Typography>
                )}
                {patientData.treatmentHistory && (
                <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                    <strong>Treatment History:</strong> {patientData.treatmentHistory}
                </Typography>
                )}
            </>
            )}

            {/* Other reasons */}
            {patientData.reasonForReferral === 'Other/s, Specify' && patientData.otherReason && (
            <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                <strong>Other Reason:</strong> {patientData.otherReason}
            </Typography>
            )}
          <Divider sx={{ bgcolor: colors.grey[500], my: 2 }} />
          {/* Referring DOTS Staff Information  */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
            <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}><strong>Name of Referring DOTS Staff:</strong> {patientData.dotsStaffName}</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
            <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}><strong>Contact Number:</strong> {patientData.dotsStaffContact} </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
            <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}><strong>Designation:</strong> {patientData.dotsStaffDesignation}</Typography>
            </Grid>
          </Grid>
          <Divider sx={{ bgcolor: colors.grey[400], my: 2 }} />
        {/* Return Slip */}
          <Typography variant="h6" gutterBottom component="div" sx={{ fontWeight: 'bold', color: colors.greenAccent[500], fontSize: '1.25rem' }}>
              Return Slip
          </Typography>
          <Divider sx={{ bgcolor: colors.grey[400], my: 2 }} />
        {/* Referring Unit */}
        <Grid container spacing={2}>
            <Grid item xs={12} sm={12}>
              <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}><strong>Name of Referring Unit:</strong> {patientData.referringFacilityName}</Typography>
              <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}><strong>Address of Referring Unit:</strong> {patientData.referringFacilityAddress}</Typography>
            </Grid>
        </Grid>
        <Divider sx={{ bgcolor: colors.grey[500], my: 2 }} />
        {/* Receiving Unit */}
        <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                    <strong>Name of Receiving Unit:</strong> {patientData.receivingFacilityName}
                    </Typography>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                    <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                    <strong>Date Received:</strong> {new Date(patientData.receivingFacilityDateReceived).toLocaleDateString()}
                    </Typography>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                    <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                    <strong>Contact Number:</strong> {patientData.receivingFacilityContact}
                    </Typography>
                    </Grid>
                    <Grid item xs={12} sm={10}>
                    <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                    <strong>Address of Receiving Unit:</strong> {patientData.receivingFacilityAddress}
                    </Typography>
                  </Grid>
              {/* Patient's full name */}
                  <Grid item xs={12} sm={10}>
                    <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}><strong>Patient's Full Name:</strong> {patientData.fullName}</Typography>
                  </Grid>
              {/* Receiving DOTS Staff */}
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}><strong>Name of Referring DOTS Staff:</strong> {patientData.receivingStaffName}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                    <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}><strong>Contact Number:</strong> {patientData.receivingStaffContact} </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                    <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}><strong>Designation:</strong> {patientData.receivingStaffDesignation}</Typography>
                    </Grid>
                  </Grid>
        <Divider sx={{ bgcolor: colors.grey[500], my: 2 }} />
        {/* Action Taken */}
        {/* Remarks */}
            </CardContent>
          </Card>
        </Container>
      )}

    {/* Cases tab */}
      {currentTab === 2 && (
        <Box mt={3}>
          {/* Your Cases tab content here */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center", 
              pl: 2,
              pb: 2,
            }}
          >
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
            {!isParent && ( // This will only render the button if the user is not a Parent
              <Button
                variant="contained"
                onClick={handleAddNewCaseDirectly}
                disabled={isAddCaseDisabled}
                style={{
                  backgroundColor: isAddCaseDisabled ? 'grey' : colors.greenAccent[600], 
                  color: colors.grey[100],
                  width: "125px",
                  height: "50px",
                  marginLeft: theme.spacing(2),
                }}
              >
                Add A New Case
              </Button>
            )}
          </Box>
          <Box
            sx={{
              width: '100%',
              height: '70vh', // Set the height to 70% of the viewport height or adjust as needed
              overflow: 'auto', // Enable scrolling if content overflows
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
              rows={filteredRows} 
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