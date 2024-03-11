import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../firebase.config';
import { doc, getDoc } from 'firebase/firestore';
import {
  Box, Typography, CircularProgress, 
 Grid, Container, useTheme, Card, CardContent, Divider, Button
} from '@mui/material';
import Header from '../../components/Header';
import { tokens } from '../../theme';

const TPDetail = () => {
  const { treatmentPlanId } = useParams(); // make sure this matches your route param
  const [treatmentPlan, setTreatmentPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const navigate = useNavigate();
  const goBack = () => navigate(-1);


  useEffect(() => {
    const fetchTreatmentPlan = async () => {
      setLoading(true);
      setError('');
      try {
        const docRef = doc(db, "treatmentPlan", treatmentPlanId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setTreatmentPlan(docSnap.data());
        } else {
          setError("No such treatment plan!");
        }
      } catch (err) {
        console.error("Error fetching treatment plan: ", err);
        setError("Error fetching treatment plan.");
      }
      setLoading(false);
    };

    if (treatmentPlanId) {
      fetchTreatmentPlan();
    }
  }, [treatmentPlanId]);

  const formatDate = (date) => {
    return date ? new Date(date).toLocaleDateString() : 'N/A';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box padding={3} bgcolor="background.default" color="text.primary">
        <Header title="Treatment Plan Details" />
        <Typography variant="h6" sx={{ color: colors.redAccent[500] }}>{error}</Typography>
      </Box>
    );
  }

  return (
    <Box padding={3} bgcolor="background.default" color="text.primary">
      <Header title="Treatment Plan Details" />

      {treatmentPlan ? (
        <Container sx={{ padding: theme.spacing(3), marginTop: theme.spacing(3) }}>
     
    <Card sx={{ marginBottom: theme.spacing(4), backgroundColor: colors.primary[400], padding: theme.spacing(2) }}>
      <CardContent>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: colors.greenAccent[500] }}>
          Treatment Plan Information of  {treatmentPlan.name}
        </Typography>
        <Divider sx={{ marginBottom: theme.spacing(2), bgcolor: colors.grey[500] }} />
        
        {/* First Column */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
              <strong>Treatment Regimen:</strong> {treatmentPlan.regimen || 'N/A'}
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
              <strong>Start of Treatment Plan:</strong> {formatDate(treatmentPlan.startDateTP)}
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
              <strong>Duration of Treatment:</strong> {treatmentPlan.duration || 'N/A'}
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
              <strong>End of Treatment Plan:</strong> {formatDate(treatmentPlan.endDateTP)}
            </Typography>
          </Grid>

          {/* Second Column */}
          <Grid item xs={12} md={6}>
          <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
              <strong>Medications/Type of Drug Intake:</strong> {treatmentPlan.medication || 'N/A'}
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
              <strong>Dosage:</strong> {treatmentPlan.dosage || 'N/A'}
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
              <strong>Frequency:</strong> {treatmentPlan.frequency || 'N/A'}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>


    {/* Patient Progress TP Information */}
    <Card sx={{ marginBottom: theme.spacing(4), backgroundColor: colors.primary[400], padding: theme.spacing(2) }}>
      <CardContent>

        <Divider sx={{ marginBottom: theme.spacing(2), bgcolor: colors.grey[500] }} />

        <Grid container spacing={3}>
          {/* First Column */}
          <Grid item xs={12} md={6}>
            <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
              <strong>Follow Up Schedule Dates:</strong> 
              <ul>
              {treatmentPlan.followUpDates.map((date, index) => {
                  // Convert Firestore timestamp to JavaScript Date object
                  const jsDate = date.toDate();

                  // Format date as a string
                  const dateString = jsDate.toLocaleDateString();

                  return <li key={index}>{dateString}</li>;
                })}
              </ul>
            </Typography>
          </Grid>

          {/* Second Column
          <Grid item xs={12} md={6}>
          <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
              <strong>Notes:</strong> {treatmentPlan.notes || 'N/A'}
            </Typography> 
      </Grid> */}
        </Grid>
      </CardContent>
    </Card>

      {/* Back Button */}
      <Grid container spacing={2} justifyContent="center">
        <Grid item>
        <Button 
          variant="contained" 
          onClick={goBack} 
          sx={{ backgroundColor: colors.greenAccent[600], color: colors.grey[100], mr: 1 }}
        >
          Back
        </Button>
        </Grid>
   </Grid>
    </Container>
  ) : (
    <Typography variant="h6" sx={{ color: colors.redAccent[500] }}>No treatment plan details available.</Typography>
  )}
</Box>

  );
};

export default TPDetail;
