import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { db } from '../../firebase.config';
import { doc, getDoc } from "firebase/firestore";
import { Box, Typography, CircularProgress, Paper, Grid, Container, useTheme,  Card, CardContent, Divider, Tab, Tabs } from '@mui/material';
import Header from '../../components/Header';
import { tokens } from '../../theme';

const TPDetail = () => {
  const { caseNumber } = useParams();
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState('true');
  const [currentTab, setCurrentTab] = useState(0);

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  useEffect(() => {
    const fetchPatientData = async () => {
      const docRef = doc(db, "treatmentPlan", caseNumber);
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
    <Header title="Treatment Plan" subtitle="PedTB Patient Treatment Plan" />
     <Tabs
          value={currentTab}
          onChange={handleTabChange}
          indicatorColor="secondary"
          textColor="inherit"
          fixed
        >
        <Tab label="Patient Profile" />
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
          Treatment Plan Personal Information
        </Typography>
        <Divider sx={{ marginBottom: theme.spacing(2), bgcolor: colors.grey[500] }} />
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}><strong>Full Name:</strong> {patientData.fullName}</Typography>
            <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}><strong>Status:</strong> {patientData.status}</Typography>
            <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}><strong>TP Start Date:</strong> {new Date(patientData.sdateTP).toLocaleDateString()}</Typography>
            <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}><strong>Regimen:</strong> {patientData.regimen}</Typography>
            <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}><strong>Treatment Duration:</strong> {patientData.duration}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}><strong>Medicine/s:</strong> {patientData.drug}</Typography>
            <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}><strong>Dosage:</strong> {patientData.dosage}</Typography>
            <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}><strong>Frequency:</strong> {patientData.frequency}</Typography>
            <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}><strong>Medication Start Date:</strong> {new Date(patientData.sdateMed).toLocaleDateString()}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}><strong>Notes:</strong> {patientData.notes}</Typography>
            <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}><strong>Follow Up Schedule Date:</strong> {new Date(patientData.followUpSched).toLocaleDateString()}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
          <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}><strong>TP Completed Date:</strong> {new Date(patientData.edateTP).toLocaleDateString()}</Typography>
            <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}><strong>Treatment Outcome:</strong> {patientData.outcome}</Typography>
          </Grid>
        </Grid>
        </CardContent>
        </Card>

            </Container>
             )}
            {currentTab === 1 && (
            <Box m={3}>
            </Box>

           )}
       {!patientData && currentTab === 0 && (
        <Typography variant="h6" sx={{ color: colors.redAccent[500] }}>No patient information available.</Typography>
      )}
    </Box>
  );
};

export default TPDetail;
