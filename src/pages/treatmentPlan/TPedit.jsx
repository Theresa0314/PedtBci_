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
const statuses = ["Start", "Ongoing", "End"];
const regimens = ["I. 2HRZE/4HR", "Ia. 2HRZE/10HR", "II. 2HRZES/1HRZE/5HRE", "IIa. 2HRZES/1HRZE/9HRE"];
const durations = ["6 months", "8 months", "12 months"];
const drugs = ["[H] Isoniazid", "[R] Rifampicin", "[Z] Pyrazinamide", "[E] Ethambutol", "[S] Streptomycin"];
const outcomes = ["Cured/Treatment Completed", "Treatment Failed", "Died", "Lost to Follow up", "Not Evaluated"];

const TPEdit = (handleCloseForm) => {
  const [loading, setLoading] = useState(true);
  const [treatmentPlan, setTreatmentPlan] = useState(null);
  const { treatmentPlanId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

      // Multiple menu item select props
      const ITEM_HEIGHT = 48;
      const ITEM_PADDING_TOP = 8;
      const MenuProps = {
          PaperProps: {
            style: {
              maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
              width: 250,
            },
          },
      };
  

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

  const handleDrugChange = (event) => {
    setTreatmentPlan(prev => ({ ...prev, drug: event.target.value }));
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
        Edit Treatment Plan
      </Typography>
      <form onSubmit={handleSubmit}>
        {/* Start of TP Information */}
        <Typography variant="h5" gutterBottom sx={{ color: colors.greenAccent[500], fontWeight: 'bold' }}>
          Start of TP Information
        </Typography>
        <Grid container spacing={3}>
          {/* Status */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required margin="dense">
              <InputLabel id="status-label" sx={{ color: colors.grey[100] }}>Status</InputLabel>
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

          {/* Treatment Regimen */}
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
          </Grid>

          {/* Duration of Treatment */}
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth required margin="dense">
              <InputLabel id="duration-label" sx={{ color: colors.grey[100] }}>Duration of Treatment</InputLabel>
              <Select
                labelId="duration-label"
                id="duration"
                name="duration"
                value={treatmentPlan.duration || ''}
                onChange={handleChange}
                sx={{ color: colors.grey[100] }}
              >
                {durations.map((duration) => (
                  <MenuItem key={duration} value={duration}>{duration}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Medicine / Type of Drug Intake */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth margin="dense">
              <InputLabel id="drug-label" sx={{ color: colors.grey[100] }}>Medicine / Type of Drug Intake</InputLabel>
              <Select
                labelId="drug-label"
                id="drug"
                name="drug"
                multiple
                value={treatmentPlan.drug || []}
                onChange={handleDrugChange}
                input={<OutlinedInput label="Medicine / Type of Drug Intake" sx={{ color: colors.grey[100] }} />}
                renderValue={(selected) => selected.join(', ')}
                MenuProps={MenuProps}
                sx={{ color: colors.grey[100] }}
              >
                {drugs.map((drug) => (
                  <MenuItem key={drug} value={drug}>
                    <Checkbox checked={treatmentPlan.drug.indexOf(drug) > -1} />
                    <ListItemText primary={drug} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Specify/Other Medicine */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="otherDrug"
              label="Specify/Other Medicine"
              name="otherDrug"
              variant="outlined"
              margin="dense"
              value={treatmentPlan.otherDrug || ''}
              onChange={handleChange}
              sx={{ color: colors.grey[100] }}
            />
          </Grid>

          {/* Dosage */}
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              id="dosage"
              label="Dosage"
              name="dosage"
              variant="outlined"
              margin="dense"
              value={treatmentPlan.dosage || ''}
              onChange={handleChange}
              sx={{ color: colors.grey[100] }}
            />
          </Grid>

          {/* Frequency */}
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              id="frequency"
              label="Frequency"
              name="frequency"
              variant="outlined"
              margin="dense"
              value={treatmentPlan.frequency || ''}
              onChange={handleChange}
              sx={{ color: colors.grey[100] }}
            />
          </Grid>

          {/* Date Medication Started */}
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              id="sdateMed"
              label="Date Medication Started"
              name="sdateMed"
              type="date"
              InputLabelProps={{ shrink: true }}
              variant="outlined"
              margin="dense"
              value={treatmentPlan.sdateMed || ''}
              onChange={handleChange}
              sx={{ color: colors.grey[100] }}
            />
          </Grid>

          {/* Date Medication Ended */}
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              id="edateMed"
              label="Date Medication Ended"
              name="edateMed"
              type="date"
              InputLabelProps={{ shrink: true }}
              variant="outlined"
              margin="dense"
              value={treatmentPlan.edateMed || ''}
              onChange={handleChange}
              sx={{ color: colors.grey[100] }}
            />
          </Grid>
        </Grid>

        <Divider sx={{ bgcolor: colors.grey[500], my: 2 }} />

        {/* Patient Progress TP Information */}
        <Typography variant="h5" gutterBottom sx={{ color: colors.greenAccent[500], fontWeight: 'bold' }}>
          Patient Progress TP Information
        </Typography>
        <Grid container spacing={3}>
          {/* Follow Up Schedule Date */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="followUpSched"
              label="Follow Up Schedule Date"
              name="followUpSched"
              type="date"
              InputLabelProps={{ shrink: true }}
              variant="outlined"
              margin="dense"
              value={treatmentPlan.followUpSched || ''}
              onChange={handleChange}
              sx={{ color: colors.grey[100] }}
            />
          </Grid>

          {/* Notes */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="notes"
              label="Notes"
              name="notes"
              variant="outlined"
              margin="dense"
              value={treatmentPlan.notes || ''}
              onChange={handleChange}
              sx={{ color: colors.grey[100] }}
            />
          </Grid>
        </Grid>

        <Divider sx={{ bgcolor: colors.grey[500], my: 2 }} />

        {/* End of Treatment Plan Information */}
        <Typography variant="h5" gutterBottom sx={{ color: colors.greenAccent[500], fontWeight: 'bold' }}>
          End of Treatment Plan Information
        </Typography>
        <Grid container spacing={3}>
          {/* Completion Date of Treatment Plan */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="edateTP"
              label="Completion Date of Treatment Plan"
              name="edateTP"
              type="date"
              InputLabelProps={{ shrink: true }}
              variant="outlined"
              margin="dense"
              value={treatmentPlan.edateTP || ''}
              onChange={handleChange}
              sx={{ color: colors.grey[100] }}
            />
          </Grid>

          {/* Treatment Outcome */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth margin="dense">
              <InputLabel id="outcome-label" sx={{ color: colors.grey[100] }}>Treatment Outcome</InputLabel>
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
