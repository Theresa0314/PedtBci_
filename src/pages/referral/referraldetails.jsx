import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase.config';
import {
  Box, Typography, CircularProgress, Container, Card, CardContent, Divider, 
  useTheme, Paper, Grid, Tab, Tabs
} from '@mui/material';
import Header from '../../components/Header';
import { tokens } from '../../theme';

const ReferralDetails = () => {
  const { referralId } = useParams(); // Use the referral ID from the URL
  const [referralData, setReferralData] = useState(null);
  const [patientData, setPatientData] = useState(null);
  const [currentTab, setCurrentTab] = useState(0); // Added state for current tab
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  useEffect(() => {
    const fetchReferralAndPatientData = async () => {
      // Fetch the referral data
      const referralDocRef = doc(db, "referralform", referralId);
      const referralDocSnap = await getDoc(referralDocRef);
  
      if (referralDocSnap.exists()) {
        const referralData = referralDocSnap.data();
        setReferralData(referralData);
        
        // Use the caseNumber from the referral data to fetch the patient data
        const caseNumber = referralData.caseNumber;
        const patientQuery = query(collection(db, "patientsinfo"), where("caseNumber", "==", caseNumber));
        const patientQuerySnapshot = await getDocs(patientQuery);
        
        if (!patientQuerySnapshot.empty) {
          // Assuming caseNumber is unique and there's only one matching patient document
          const patientData = patientQuerySnapshot.docs[0].data();
          setPatientData(patientData);
        } else {
          console.log("No such patient!");
        }
      } else {
        console.log("No such referral!");
      }
      setLoading(false);
    };
  
    fetchReferralAndPatientData();
  }, [referralId]);
  

    // Function to calculate age from date of birth
    const calculateAge = (dob) => {
        const birthDate = new Date(dob);
        const difference = Date.now() - birthDate.getTime();
        const ageDate = new Date(difference);
        return Math.abs(ageDate.getUTCFullYear() - 1970);
      };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box padding={3} bgcolor="background.default" color="text.primary">
        <Header title="Referral Information" subtitle="Managing referral data" />
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          indicatorColor="secondary"
          textColor="inherit"
          variant="fullWidth"
        >
        <Tab label="Patient Info" />
        <Tab label="Referral Info" />
        <Tab label="Receiving Info" />
      </Tabs>

      {referralData && patientData ? (
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
       {currentTab === 0 && (
        //<Card raised sx={{ backgroundColor: colors.primary[400], mb: 4 }}>
          <CardContent>
          <Typography variant="h6" gutterBottom component="div" sx={{ fontWeight: 'bold', color: colors.greenAccent[500], fontSize: '1.25rem' }}>
              Patient Information
            </Typography>
            <Divider sx={{ bgcolor: colors.grey[500], my: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}><strong>Full Name:</strong> {patientData.fullName}</Typography>
            <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}><strong>Age:</strong> {calculateAge(patientData.birthdate)}</Typography>
            <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}><strong>Gender:</strong> {patientData.gender}</Typography>
            </Grid>
         
             <Grid item xs={12} sm={6}>
            <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}><strong>Weight:</strong> {patientData.weight} kg</Typography>
            <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
              <strong>Address:</strong> {`${patientData.houseNameBlockStreet}, ${patientData.barangay}, ${patientData.city}, ${patientData.province}`}
            </Typography>
            </Grid>
            </Grid>
          </CardContent>
       // </Card>
         )}
       {/* Referring Facility */}

        </Container>
      ) : (
        <Typography variant="h6" sx={{ color: colors.redAccent[500] }}>
          No referral or patient information available.
        </Typography>
      )}
    </Box>
  );
};

export default ReferralDetails;
