import React, { useState, useEffect } from 'react';
import {
  Grid, TextField, FormControl, InputLabel, Select, MenuItem, Typography, Button, Container, useTheme,
  OutlinedInput, ListItemText, Checkbox, Divider
} from '@mui/material';
import { tokens } from "../../theme";
import { db } from '../../firebase.config';
import { doc, collection, getDoc, addDoc } from 'firebase/firestore';

// Sample data for dropdowns
const statuses = ["Start", "Ongoing", "End"];
const regimens = ["I. 2HRZE/4HR", "Ia. 2HRZE/10HR", "II. 2HRZES/1HRZE/5HRE", "IIa. 2HRZES/1HRZE/9HRE"];
const durations = ["6 months", "8 months", "12 months"]; //duration of treatment
const drugs = ["[H] Isoniazid", "[R] Rifampicin", "[Z] Pyrazinamide", "[E] Ethambutol", "[S] Streptomycin"];
const outcomes = ["Cured/Treatment Completed", "Treatment Failed", "Died", "Lost to Follow up", "Not Evaluated"];

const TPForm = ({ handleCloseForm, handleUpdateTP, caseId, caseNumber }) => {
   // State hooks for form data
   const [status, setStatus] = useState('');
   const [regimen, setRegimen] = useState('');
   const [duration, setDuration] = useState('');
   const [drug, setDrug] = useState([]);
   const [otherDrug, setOtherDrug] = useState('');
   const [dosage, setDosage] = useState('');
   const [frequency, setFrequency] = useState('');
   const [sdateMed, setSdateMed] = useState('');
   const [edateMed, setEdateMed] = useState('');
   const [followUpSched, setFollowUpSched] = useState('');
   const [notes, setNotes] = useState('');
   const [edateTP, setEdateTP] = useState('');
   const [outcome, setOutcome] = useState('');

  // New state hook for startDate
  const [startDate, setStartDate] = useState('');

   // Fetch case start date when the component mounts or when caseId changes
   useEffect(() => {
    const fetchStartDate = async () => {
      // Fetch the start date from the database using the caseId
      // Example using Firestore:
      const docRef = doc(db, 'cases', caseId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setStartDate(docSnap.data().startDate); // Assuming startDate is a field in your case document
      } else {
        console.log('No such case!');
      }
    };

    fetchStartDate();
  }, [caseId]);



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

    // Handle drug change
    const handleDrugChange = (event) => {
        const {
          target: { value },
        } = event;
        setDrug(
          typeof value === 'string' ? value.split(',') : value,
        );
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const TPData = {
          caseId, // Directly used from props
          caseNumber, // Directly used from props
          startDate,
          status,
          edateTP,
          sdateMed,
          edateMed,
          dosage,
          frequency,
          duration,
          regimen,
          drug,
          otherDrug,
          notes,
          outcome,
          followUpSched,
        };
      
        try {
            const docRef = await addDoc(collection(db, "treatmentPlan"), TPData);
            const newTP = { ...TPData, id: docRef.id };
            handleUpdateTP(newTP); // Call the function to update the treatment plan list
            handleCloseForm(); // Close the form after submission
          } catch (e) {
            console.error("Error adding document: ", e);
          }
        };

    return (
        <Container component="main" maxWidth="md" sx={{
            backgroundColor: colors.blueAccent[800], 
            padding: theme.spacing(6), 
            borderRadius: theme.shape.borderRadius
        }}>
            <form onSubmit={handleSubmit}>
                {/* Start Section */}
                <Typography variant="h5" gutterBottom sx={{ color: colors.greenAccent[500], fontWeight: 'bold' }}>
                    Start of TP Information
                </Typography>
                <Grid container spacing={3}>
                <Grid item xs={6}>
                <FormControl fullWidth required margin="dense">
                    <InputLabel id="status-label">Status</InputLabel>
                    <Select
                    required
                    labelId="status-label"
                    id="status"
                    name="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    >
                    <MenuItem value="" ></MenuItem>
                    {statuses.map((option) => (
                        <MenuItem key={option} value={option}>{option}</MenuItem>
                    ))}
                    </Select>
                </FormControl>
                </Grid>

                <Grid item xs={3}>
                <FormControl fullWidth required margin="dense">
                    <InputLabel id="regimen-label">Treatment Regimen</InputLabel>
                    <Select
                    required
                    labelId="regimen-label"
                    id="regimen"
                    name="regimen"
                    value={regimen}
                    onChange={(e) => setRegimen(e.target.value)}
                    >
                    <MenuItem value="" ></MenuItem>
                    {regimens.map((option) => (
                        <MenuItem key={option} value={option}>{option}</MenuItem>
                    ))}
                    </Select>
                </FormControl>
                </Grid>

                <Grid item xs={3}>
                <FormControl fullWidth required margin="dense">
                    <InputLabel id="duration-label">Duration of Treatment</InputLabel>
                    <Select
                    required
                    labelId="duration-label"
                    id="duration"
                    name="duration"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    >
                    <MenuItem value="" ></MenuItem>
                    {durations.map((option) => (
                        <MenuItem key={option} value={option}>{option}</MenuItem>
                    ))}
                    </Select>
                </FormControl>
                </Grid>

                <Grid item xs={6}>
                <FormControl fullWidth margin="dense">
                    <InputLabel id="drug-label">Medicine / Type of Drug Intake</InputLabel>
                    <Select 
                    
                    labelId="drug-label"
                    id="drug"
                    name="drug"
                    multiple 
                    value={drug}
                    onChange={handleDrugChange}
                    input={<OutlinedInput label="Type of Drug Intake" />}
                    renderValue={(selected) => selected.join(', ')}
                    MenuProps={MenuProps}
                    >
                    <MenuItem value="" ></MenuItem>
                    {drugs.map((option) => (
                        <MenuItem key={option} value={option}>
                            <Checkbox checked={drug.indexOf(option) > -1} />
                            <ListItemText primary={option} />
                        </MenuItem>
                    ))}
                    </Select >
                </FormControl>
                </Grid>

                <Grid item xs={6}>
                <TextField
                        fullWidth
                        id="otherDrug"
                        label="Specify/Other Medicine"
                        name="otherDrug"
                        variant="outlined"
                        margin="dense"
                        value={otherDrug}
                        onChange={(e) => setOtherDrug(e.target.value)}
                    />
                </Grid>  

                <Grid item xs={3}>
                <TextField
                        required
                        fullWidth
                        id="dosage"
                        label="Dosage"
                        name="dosage"
                        variant="outlined"
                        margin="dense"
                        value={dosage}
                        onChange={(e) => setDosage(e.target.value)}
                    />
                </Grid>

                <Grid item xs={3}>
                <TextField
                        required
                        fullWidth
                        id="frequency"
                        label="Frequency"
                        name="frequency"
                        variant="outlined"
                        margin="dense"
                        value={frequency}
                        onChange={(e) => setFrequency(e.target.value)}
                    />
                </Grid>

                <Grid item xs={3}>
                <TextField
                        required
                        fullWidth
                        id="sdateMed"
                        label="Date Medication Started"
                        name="sdateMed"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        variant="outlined"
                        margin="dense"
                        value={sdateMed}
                        onChange={(e) => setSdateMed(e.target.value)}
                    />
                </Grid>
                
                <Grid item xs={3}>
                <TextField
                        required
                        fullWidth
                        id="edateMed"
                        label="Date Medication Ended"
                        name="edateMed"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        variant="outlined"
                        margin="dense"
                        value={edateMed}
                        onChange={(e) => setEdateMed(e.target.value)}
                    />
                </Grid>
            </Grid>
                <Divider sx={{ bgcolor: colors.grey[500], my: 2 }} />

                {/* In Progress Section */}
                <Typography marginTop="1vh" variant="h5" gutterBottom sx={{ color: colors.greenAccent[500], fontWeight: 'bold' }}>
                    Patient Progress TP Information
                </Typography>
                <Grid container spacing={3}>
                    <Grid item xs={6} >
                        <TextField
                        
                        fullWidth
                        id="followUpSched"
                        label="Follow Up Schedule Date"
                        name="followUpSched"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        variant="outlined"
                        margin="dense"
                        value={followUpSched}
                        onChange={(e) => setFollowUpSched(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                             
                             fullWidth
                             id="notes"
                             label="Notes"
                             name="notes"
                             variant="outlined"
                             margin="dense"
                             value={notes}
                             onChange={(e) => setNotes(e.target.value)}
                        />
                    </Grid>
                </Grid>

                <Divider sx={{ bgcolor: colors.grey[500], my: 2 }} />

                {/* End Section */}
                <Typography marginTop="1vh" variant="h5" gutterBottom sx={{ color: colors.greenAccent[500], fontWeight: 'bold' }}>
                    End of Treatment Plan Information
                </Typography>
                <Grid container spacing={3}>
                <Grid item xs={6}>
                        <TextField
                        
                        fullWidth
                        id="edateTP"
                        label="Completion Date of Treatment Plan"
                        name="edateTP"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        variant="outlined"
                        margin="dense"
                        value={edateTP}
                        onChange={(e) => setEdateTP(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <FormControl fullWidth margin="dense">
                        <InputLabel id="outcome-label">Treatment Outcome</InputLabel>
                        <Select
                        labelId="outcome-label"
                        id="outcome"
                        name="outcome"
                        value={outcome}
                        onChange={(e) => setOutcome(e.target.value)}
                        >
                        <MenuItem value="" ></MenuItem>
                        {outcomes.map((option) => (
                            <MenuItem key={option} value={option}>{option}</MenuItem>
                        ))}
                        </Select>
                        </FormControl>
                    </Grid>
                </Grid>

            <Divider sx={{ bgcolor: colors.grey[500], my: 2 }} />
                {/* Submit and Cancel Buttons */}
                <Grid container spacing={2} justifyContent="center">
                    <Grid item>
                    <Button type="submit" variant="contained" sx={{ backgroundColor: colors.greenAccent[600], color: colors.grey[100], mr: 1 }}>
                            Save
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button onClick={handleCloseForm} variant="outlined" sx={{ color: colors.grey[100], borderColor: colors.grey[700] }}>
                            Cancel
                        </Button>
                    </Grid>
                </Grid>
            </form>
        </Container>
    );
};

export default TPForm;