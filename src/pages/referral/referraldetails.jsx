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

       {/* Referral Information */}
       {currentTab === 1 && referralData && (
        <>
    
    {/* Referring Facility Information Card */}
        <Card raised sx={{ backgroundColor: colors.primary[400], mb: 4 }}>
        <CardContent>

  
        <Typography variant="h6" gutterBottom component="div" sx={{ fontWeight: 'bold', color: colors.greenAccent[500], fontSize: '1.25rem' }}>
            Referring Facility Information
        </Typography>
        <Divider sx={{ bgcolor: colors.grey[500], my: 2 }} />

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>

          <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}><strong>Referring Facility:</strong> {referralData.referringFacilityName}</Typography>
          <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}><strong>Contact Number:</strong> {referralData.referringFacilityContactNumber}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
          <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}><strong>Email:</strong> {referralData.referringFacilityEmail}</Typography>
          <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}><strong>Address:</strong> {referralData.referringFacilityAddress}</Typography>
          </Grid>
        </Grid>
        </CardContent>
        </Card>

       {/* Referring DOTS Staff Information Card */}
       <Card raised sx={{ backgroundColor: colors.primary[400], mb: 4 }}>
        <CardContent>
            <Typography variant="h6" gutterBottom component="div" sx={{ fontWeight: 'bold', color: colors.greenAccent[500], fontSize: '1.25rem' }}>
                 DOTS Staff Information
            </Typography>
            <Divider sx={{ bgcolor: colors.grey[500], my: 2 }} />
            <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
            <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}><strong>Full Name:</strong> {referralData.dotsStaffName}</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
            <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}><strong>Contact Info:</strong> {referralData.dotsStaffContact} </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
            <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}><strong>Designation:</strong> {referralData.dotsStaffDesignation}</Typography>
            </Grid>
        </Grid>
      </CardContent>
    </Card>

        {/* Reason for Referral Card */}
        <Card raised sx={{ backgroundColor: colors.primary[400], mb: 4 }}>
        <CardContent>
            <Typography variant="h6" gutterBottom component="div" sx={{ fontWeight: 'bold', color: colors.greenAccent[500], fontSize: '1.25rem' }}>
            Reason For Referral
            </Typography>
            <Divider sx={{ bgcolor: colors.grey[500], my: 2 }} />
            
            {/* Always show the main reason */}
            <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
            <strong>Main Reason:</strong> {referralData.reasonForReferral}
            </Typography>

            {/* Additional details based on the main reason */}
            {referralData.reasonForReferral === 'For Screening' && referralData.subReason && (
            <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                <strong>Screening Details:</strong> {referralData.subReason}
            </Typography>
            )}

            {referralData.reasonForReferral === 'For Continuation of Treatment/Decentralize' && (
            <>
                {referralData.bacteriologicalStatus && (
                <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                    <strong>Bacteriological Status:</strong> {referralData.bacteriologicalStatus}
                </Typography>
                )}
                {referralData.anatomicalSite && (
                <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                    <strong>Anatomical Site:</strong> {referralData.anatomicalSite}
                </Typography>
                )}
                {referralData.drugSusceptibility && (
                <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                    <strong>Drug Susceptibility:</strong> {referralData.drugSusceptibility}
                </Typography>
                )}
                {referralData.treatmentHistory && (
                <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                    <strong>Treatment History:</strong> {referralData.treatmentHistory}
                </Typography>
                )}
            </>
            )}

            {/* Other reasons */}
            {referralData.reasonForReferral === 'Other/s, Specify' && referralData.otherReason && (
            <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                <strong>Other Reason:</strong> {referralData.otherReason}
            </Typography>
            )}
        </CardContent>
        </Card>

      </>
        )}

        {/* Receiving Information */}
        {currentTab === 2 && (
        <>
            {/* Receiving Facility Information Card */}
            <Card raised sx={{ backgroundColor: colors.primary[400], mb: 4 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom component="div" sx={{ fontWeight: 'bold', color: colors.greenAccent[500], fontSize: '1.25rem' }}>
                    Receiving Facility Information
                    </Typography>
                    <Divider sx={{ bgcolor: colors.grey[500], my: 2 }} />
                    <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                    <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                    <strong>Name of Receiving Unit:</strong> {referralData.receivingFacilityName}
                    </Typography>
                    
                    <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                    <strong>Date Received:</strong> {referralData.receivingFacilityDateReceived}
                    </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                    <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                    <strong>Contact Number:</strong> {referralData.receivingFacilityContact}
                    </Typography>
                    <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                    <strong>Address:</strong> {referralData.receivingFacilityAddress}
                    </Typography>
                    </Grid>
                    </Grid>
                </CardContent>
                </Card>
    
                {/* Receiving DOTS Staff Information Card */}
                <Card raised sx={{ backgroundColor: colors.primary[400], mb: 4 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom component="div" sx={{ fontWeight: 'bold', color: colors.greenAccent[500], fontSize: '1.25rem' }}>
                    Receiving DOTS Staff Information
                    </Typography>
                    <Divider sx={{ bgcolor: colors.grey[500], my: 2 }} />

                    <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                    <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                    <strong>Name:</strong> {referralData.receivingStaffName}
                    </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                    <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                    <strong>Contact
                         Info:</strong> {referralData.receivingStaffContact}
                    </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                    <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                    <strong>Designation:</strong> {referralData.receivingStaffDesignation}
                    </Typography>
                    </Grid>
                    </Grid>
                </CardContent>
                </Card>

                {/* Action Taken Card */}
                <Card raised sx={{ backgroundColor: colors.primary[400], mb: 4 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom component="div" sx={{ fontWeight: 'bold', color: colors.greenAccent[500], fontSize: '1.25rem' }}>
                    Action Taken
                    </Typography>
                    <Divider sx={{ bgcolor: colors.grey[500], my: 2 }} />
                    <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                    <strong>Action:</strong> {referralData.actionTaken}
                    </Typography>

                    {/* Display fields based on action taken */}
                    {referralData.actionTaken === 'Lab Test Performed' && (
                    <>
                        {referralData.labTestType && (
                        <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                            <strong>Type of Test:</strong> {referralData.labTestType}
                        </Typography>
                        )}
                        {referralData.labTestDate && (
                        <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                            <strong>Date of Test:</strong> {referralData.labTestDate}
                        </Typography>
                        )}
                        {referralData.labTestResults && (
                        <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                            <strong>Results:</strong> {referralData.labTestResults}
                        </Typography>
                        )}
                    </>
                    )}

                    {referralData.actionTaken === 'Patient Started/Resumed Treatment' && (
                    <>
                        {referralData.treatmentDateRegistered && (
                        <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                            <strong>Date Registered/Resumed:</strong> {referralData.treatmentDateRegistered}
                        </Typography>
                        )}
                        {referralData.treatmentRegimen && (
                        <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                            <strong>Regimen:</strong> {referralData.treatmentRegimen}
                        </Typography>
                        )}
                    </>
                    )}

                    {referralData.actionTaken === 'Not Treated' && (
                    <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                        <strong>Reason for Not Treating:</strong> {referralData.notTreatedReason || 'Not specified'}
                    </Typography>
                    )}

                    {referralData.actionTaken === 'Other' && (
                    <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                        <strong>Specify Other Action:</strong> {referralData.otherActionSpecification || 'Not specified'}
                    </Typography>
                    )}
                </CardContent>
                </Card>


             {/* Remarks Card */}
             <Card raised sx={{ backgroundColor: colors.primary[400], mb: 4 }}>
                <CardContent>
                <Typography variant="h6" gutterBottom component="div" sx={{ fontWeight: 'bold', color: colors.greenAccent[500], fontSize: '1.25rem' }}>
                    Remarks
                </Typography>
                <Divider sx={{ bgcolor: colors.grey[500], my: 2 }} />
                    <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                        <strong>Addtional Notes:</strong> {referralData.remarks}
                    </Typography>
                </CardContent>
            </Card>

        </>
        )}


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
