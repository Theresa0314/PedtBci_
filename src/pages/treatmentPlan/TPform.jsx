import React, { useState } from 'react';
import {
  Grid, TextField, FormControl, InputLabel, Select, MenuItem, Typography, Button, RadioGroup, FormControlLabel, Radio, Container, Divider, Checkbox, useTheme,
  OutlinedInput, ListItemText
} from '@mui/material';
import { tokens } from "../../theme";
import { db } from '../../firebase.config';
import { collection, addDoc } from 'firebase/firestore';

// Sample data for dropdowns
const outcomes = ["Cured/Treatment Completed", "Treatment Failed", "Died", "Lost to Follow up", "Not Evaluated"];
const statuses = ["Start", "In Progress", "End"];
const regimens = ["I. 2HRZE/4HR", "Ia. 2HRZE/10HR", "II. 2HRZES/1HRZE/5HRE", "IIa. 2HRZES/1HRZE/9HRE"];
const durations = ["6 months", "8 months", "12 months"]; //duration of treatment
const drugs = ["[H] Isonlazid", "[R] Rifampicin", "[Z] Pyrazinamide", "[E] Ethambutol", "[S] Streptomycin "];

const TPForm = ({ handleCloseForm, handleUpdateTP }) => {
    // State hooks
    const [fullName, setFullName] = useState('');
    const [status, setStatus] = useState('');
    const [sdateTP, setSdateTP] = useState('');
    const [edateTP, setEdateTP] = useState('');
    const [sdateMed, setSdateMed] = useState('');
    const [edateMed, setEdateMed] = useState('');
    const [duration, setDuration] = useState('');
    const [regimen, setRegimen] = useState('');
    const [drug, setDrug] = React.useState([]);; 
    const [medPrescription, setMedPrescription] = useState('');
    const [notes, setNotes] = useState('');
    const [outcome, setOutcome] = useState('');
    const [followUpSched, setFollowUpSched] = useState('');
    
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    //Multiple menu item select
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
    
    //handle drug change
    const handleDrugChange = (event: SelectChangeEvent<typeof drug>) => {
        const {
          target: { value },
        } = event;
        setDrug(
          // On autofill we get a stringified value.
          typeof value === 'string' ? value.split(',') : value,
        );
      };


    const handleSubmit = async (event) => {
        event.preventDefault();
      
        // Generate a unique case number
        const caseNumber = 'CN-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5).toUpperCase();
      
        // Get the current date and time in Philippine time
        const dateAdded = new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' });
      
        const TPData = {
          fullName,
          status,
          sdateTP,
          edateTP,
          sdateMed,
          edateMed,
          duration,
          regimen,
          drug,
          medPrescription,
          notes,
          outcome,
          followUpSched,
          caseNumber, // Add the generated case number
          dateAdded  // Add the generated date added
        };
      
        try {
            const docRef = await addDoc(collection(db, "treatmentPlan"), TPData);
            console.log("Document written with ID: ", docRef.id);
        
            const newTP = { ...TPData, id: docRef.id };
            handleUpdateTP(newTP); // Update the Treatment Plan list in the parent component
            
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
            <Typography variant="h2" gutterBottom sx={{ color: colors.white, fontWeight: 'bold' }}>
                Treatment Plan Information
            </Typography>

            <form onSubmit={handleSubmit}>
                {/* Start Section */}
                <Typography variant="h5" gutterBottom sx={{ color: colors.greenAccent[500], fontWeight: 'bold' }}>
                    Start of TP Information
                </Typography>
                <Grid container spacing={3}>
                <Grid item xs={6}>
                    <TextField
                        required
                        fullWidth
                        id="fullName"
                        label="Full Name"
                        name="fullName"
                        variant="outlined"
                        margin="dense"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                    />
                </Grid>
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
                    <TextField
                        required
                        fullWidth
                        id="sdateTP"
                        label="Start Date of Treatment Plan"
                        name="sdateTP"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        variant="outlined"
                        margin="dense"
                        value={sdateTP}
                        onChange={(e) => setSdateTP(e.target.value)}
                    />
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
                <Grid item xs={3} marginBottom="2vh">
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
                <Grid container spacing={3}>
                <Grid item xs={4}  marginLeft="3vh">
                    <Typography variant="body1" gutterBottom>Medical Prescription Available:</Typography>
                    <RadioGroup
                    row
                    name="medPrescription"
                    value={medPrescription}
                    onChange={(e) => setMedPrescription(e.target.value)}
                    >
                    <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                    <FormControlLabel value="no" control={<Radio />} label="No" />
                    </RadioGroup>
                </Grid>
                <Grid item xs={6}>
                <FormControl fullWidth margin="dense">
                    <InputLabel id="drug-label">Type of Drug Intake</InputLabel>
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
                <Grid item xs={3}  marginLeft="3vh">
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
                
                        fullWidth
                        id="edateMed"
                        label="Date Medication Ended"
                        name="edateMed"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        variant="outlined"
                        margin="dense"
                        value={edateTP}
                        onChange={(e) => setEdateMed(e.target.value)}
                    />
                </Grid>
            </Grid>
                <Divider sx={{ bgcolor: colors.grey[500], my: 2 }} />

                {/* In Progress Section */}
                <Typography marginTop="1vh" variant="h5"marginLeft="3vh" gutterBottom sx={{ color: colors.greenAccent[500], fontWeight: 'bold' }}>
                    Patient Progress TP Information
                </Typography>
                <Grid container spacing={3}marginLeft="1vh">
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
                <Typography marginTop="1vh" marginLeft="3vh" variant="h5" gutterBottom sx={{ color: colors.greenAccent[500], fontWeight: 'bold' }}>
                    End of Treatment Plan Information
                </Typography>
                <Grid container spacing={3} marginLeft="1vh">
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
                </Grid>

            <Divider sx={{ bgcolor: colors.grey[500], my: 2 }} />

                <Grid container justifyContent="center" sx={{ mt: 4 }}>
                    <Button type="submit" variant="contained" sx={{ backgroundColor: colors.greenAccent[600], color: colors.grey[100], mr: 1 }}>
                        Save Information
                    </Button>
                    <Button variant="outlined" onClick={handleCloseForm} sx={{ color: colors.grey[100], borderColor: colors.grey[700] }}>
                        Cancel
                    </Button>
                </Grid>
            </form>
        </Container>
    );
};

export default TPForm;