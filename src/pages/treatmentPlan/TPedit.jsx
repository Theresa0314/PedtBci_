import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Grid, TextField, FormControl, InputLabel,
  Select, MenuItem, Checkbox, ListItemText, OutlinedInput, Button, Divider, CircularProgress, useTheme
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase.config';
import { tokens } from "../../theme";

// Placeholders for dropdown options
const statuses = ["Ongoing", "Lost to Follow Up","End"];
const outcomes = ["Cured/Treatment Completed", "Treatment Failed", "Died", "Lost to Follow up", "Not Evaluated"];

const regimens = ["I. 2HRZE/4HR", "Ia. 2HRZE/10HR", "II. 2HRZES/1HRZE/5HRE", "IIa. 2HRZES/1HRZE/9HRE"];

const TPEdit = (handleCloseForm) => {
  const [loading, setLoading] = useState(true);
  const [treatmentPlan, setTreatmentPlan] = useState(null);
  const { treatmentPlanId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  
  //Fetch treatmen plan
  useEffect(() => {
    const fetchTreatmentPlan = async () => {
      const docRef = doc(db, 'treatmentPlan', treatmentPlanId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setTreatmentPlan(docSnap.data());
        setLoading(false);
      } else {
        console.error('No treatment plan found!');
        navigate(-1);
      }
    };

    fetchTreatmentPlan();
  }, [treatmentPlanId, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTreatmentPlan(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (treatmentPlan) {
      try {
        await updateDoc(doc(db, 'treatmentPlan', treatmentPlanId), treatmentPlan);
        navigate(-1); // Goes back to the previous page
      } catch (error) {
        console.error('Error updating document:', error);
      }
    }
  };

  const handleCancel = () => {
    navigate(-1); // Goes back to the previous page
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Container component="main" maxWidth="md" sx={{
      backgroundColor: colors.blueAccent[800],
      padding: theme.spacing(6),
      borderRadius: theme.shape.borderRadius,
      color: colors.grey[100]
    }}>
      <Typography variant="h2" gutterBottom sx={{ fontWeight: 'bold', color: colors.white }}>
        Edit Treatment Plan of {treatmentPlan.name}
      </Typography>
      <form onSubmit={handleSubmit}>
      {/* Status */}
      <Grid  container spacing={3}>
      <Grid item xs={6}>
            <FormControl fullWidth required margin="dense">
              <InputLabel id="status-label">Status</InputLabel>
              <Select
                labelId="status-label"
                id="status"
                name="status"
                value={treatmentPlan.status || ''}
                onChange={handleChange}
                sx={{ color: colors.grey[100] }}
              >
                {statuses.map((status) => (
                  <MenuItem key={status} value={status}>{status}</MenuItem>
                ))}
              </Select>
            </FormControl>
        </Grid>
      {/* Outcome */}
      <Grid item xs={6}>
            <FormControl fullWidth required margin="dense">
              <InputLabel id="outcome-label">Treatment Outcome</InputLabel>
              <Select
                labelId="outcome-label"
                id="outcome"
                name="outcome"
                value={treatmentPlan.outcome || ''}
                onChange={handleChange}
                sx={{ color: colors.grey[100] }}
              >
                {outcomes.map((outcome) => (
                  <MenuItem key={outcome} value={outcome}>{outcome}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
          {/* //Treatment Regimen
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth required margin="dense">
              <InputLabel id="regimen-label" sx={{ color: colors.grey[100] }}>Treatment Regimen</InputLabel>
              <Select
                labelId="regimen-label"
                id="regimen"
                name="regimen"
                value={treatmentPlan.regimen || ''}
                onChange={handleChange}
                sx={{ color: colors.grey[100] }}
              >
                {regimens.map((regimen) => (
                  <MenuItem key={regimen} value={regimen}>{regimen}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid> */}



        <Divider sx={{ bgcolor: colors.grey[500], my: 2 }} />

                {/* Submit and Cancel Buttons */}
                <Grid container spacing={2} justifyContent="center">
                    <Grid item>
                        <Button 
                        type="submit" 
                        variant="contained" 
                        sx={{ backgroundColor: colors.greenAccent[600], color: colors.grey[100], mr: 1 }}
                        >
                        Save
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button 
                        onClick={handleCancel} 
                        variant="outlined" 
                        sx={{ color: colors.grey[100], borderColor: colors.grey[700] }}
                        >
                        Cancel
                        </Button>
                    </Grid>
                </Grid>
 
      </form>
    </Container>
  );
};

export default TPEdit;
