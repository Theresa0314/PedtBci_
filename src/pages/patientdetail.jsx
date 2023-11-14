import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { db } from '../firebase.config';
import { doc, getDoc } from "firebase/firestore";
import { Box, Typography, CircularProgress, Paper, Grid, Container, useTheme,  Card, CardContent, Divider, Tab, Tabs } from '@mui/material';
import Header from '../components/Header';
import { tokens } from '../theme';

const PatientDetail = () => {
  const { caseNumber } = useParams();
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState(0);

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

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
        marginLeft: theme.spacing(1),
        backgroundColor: colors.primary[400],
        maxWidth: 'none', 
        }}
        >  
    {/* Personal Information */}
        <Card raised sx={{ marginBottom: theme.spacing(4), backgroundColor: colors.primary[400] }}>
        <CardContent>
        <Typography variant="h6" gutterBottom component="div" sx={{ fontWeight: 'bold', color: colors.greenAccent[500], fontSize: '1.25rem' }}>
          Personal Information
        </Typography>
        <Divider sx={{ marginBottom: theme.spacing(2), bgcolor: colors.grey[500] }} />
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}><strong>Full Name:</strong> {patientData.fullName}</Typography>
            <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}><strong>Alias:</strong> {patientData.alias || 'N/A'}</Typography>
            <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}><strong>Birthdate:</strong> {new Date(patientData.birthdate).toLocaleDateString()}</Typography>
            <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}><strong>Gender:</strong> {patientData.gender}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}><strong>Height:</strong> {patientData.height} cm</Typography>
            <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}><strong>Weight:</strong> {patientData.weight} kg</Typography>
            <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
              <strong>Address:</strong> {`${patientData.houseNameBlockStreet}, ${patientData.barangay}, ${patientData.city}, ${patientData.province}`}
            </Typography>
          </Grid>
        </Grid>
        </CardContent>
        </Card>

       {/*Contact Information */}
        <Card raised sx={{ marginBottom: theme.spacing(4), backgroundColor: colors.primary[400] }}>
        <CardContent>
            <Typography variant="h5" gutterBottom sx={{ color: colors.greenAccent[500], fontWeight: 'bold', fontSize: '1.25rem' }}>
            Contact Information
            </Typography>
            <Divider sx={{ marginBottom: theme.spacing(2), bgcolor: colors.grey[500] }} />
            <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
                <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                  <strong>Parent/Guardian Name:</strong> {patientData.parentName}
                </Typography>
                <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                  <strong>Parent/Guardian Email:</strong> {patientData.parentEmail}
                </Typography>
                <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                  <strong>Secondary Contact Name:</strong> {patientData.secondaryContactName || 'N/A'}
                </Typography>
                <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                  <strong>Secondary Contact Email:</strong> {patientData.secondaryContactEmail || 'N/A'}
                </Typography>
                <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                  <strong>Emergency Contact Name:</strong> {patientData.emergencyContactName}
                </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
                <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                  <strong>Relationship to Patient:</strong> {patientData.relationshipToPatient}
                </Typography>
                <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                  <strong>Parent/Guardian Contact No.:</strong> {patientData.parentContactNumber}
                </Typography>
                <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                  <strong>Secondary Relationship to Patient:</strong> {patientData.secondaryRelationshipToPatient || 'N/A'}
                </Typography>
                <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                  <strong>Secondary Contact Number:</strong> {patientData.secondaryContactNumber || 'N/A'}
                </Typography>
                <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                  <strong>Emergency Contact Number:</strong> {patientData.emergencyContactNumber}
                </Typography>
            </Grid>
            </Grid>
        </CardContent>
        </Card>


          
          {/* Medical Information */}
          <Card raised sx={{ marginBottom: theme.spacing(4), backgroundColor: colors.primary[400] }}>
            <CardContent>
                <Typography variant="h5" gutterBottom sx={{ color: colors.greenAccent[500], fontWeight: 'bold', fontSize: '1.25rem' }}>
                Medical Information
                </Typography>
                <Divider sx={{ marginBottom: theme.spacing(2), bgcolor: colors.grey[500] }} />
                <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                    <Typography variant="body1" sx={{ fontSize: '1rem', marginBottom: '0.5rem' }}>
                    <strong>Annual chest x-ray available:</strong> {patientData.chestXrayAvailable === 'yes' ? 'Yes' : 'No'}
                    </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Typography variant="body1" sx={{ fontSize: '1rem', marginBottom: '0.5rem' }}>
                    <strong>History of TB drug treatment (of the child):</strong> {patientData.tbDrugHistory === 'yes' ? 'Yes' : 'No'}
                    </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Typography variant="body1" sx={{ fontSize: '1rem', marginBottom: '0.5rem' }}>
                    <strong>Experiencing symptoms in the past 2 weeks:</strong> {patientData.symptomsLastTwoWeeks === 'yes' ? 'Yes' : 'No'}
                    </Typography>
                </Grid>
                </Grid>
            </CardContent>
            </Card>
            </Container>
             )}
            {currentTab === 1 && (
            <Box m={3}>
            {/* Your Cases tab content here */}
            </Box>

           )}
       {!patientData && currentTab === 0 && (
        <Typography variant="h6" sx={{ color: colors.redAccent[500] }}>No patient information available.</Typography>
      )}
    </Box>
  );
};

export default PatientDetail;
