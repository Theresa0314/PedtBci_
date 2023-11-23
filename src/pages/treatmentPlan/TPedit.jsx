import React, { useState, useEffect } from 'react';
import {
    Grid, TextField, FormControl, InputLabel, Select, MenuItem, Typography, Button, Container, Divider, Checkbox, useTheme,
    OutlinedInput, ListItemText
  } from '@mui/material';
import { tokens } from "../../theme";
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase.config';

// Sample data for dropdowns
const outcomes = ["Cured/Treatment Completed", "Treatment Failed", "Died", "Lost to Follow up", "Not Evaluated"];
const statuses = ["Start", "Ongoing", "End"];
const regimens = ["I. 2HRZE/4HR", "Ia. 2HRZE/10HR", "II. 2HRZES/1HRZE/5HRE", "IIa. 2HRZES/1HRZE/9HRE"];
const durations = ["6 months", "8 months", "12 months"]; //duration of treatment
const drugs = ["[H] Isonlazid", "[R] Rifampicin", "[Z] Pyrazinamide", "[E] Ethambutol", "[S] Streptomycin "];

const TPEdit = () => {
    // State hooks
    const [fullName, setFullName] = useState('');
    const [status, setStatus] = useState('');
    const [sdateTP, setSdateTP] = useState('');
    const [edateTP, setEdateTP] = useState('');
    const [sdateMed, setSdateMed] = useState('');
    const [edateMed, setEdateMed] = useState('');
    const [dosage, setDosage] = useState('');
    const [frequency, setFrequency] = useState('');
    const [duration, setDuration] = useState('');
    const [regimen, setRegimen] = useState('');
    const [drug, setDrug] = React.useState([]);; 
    const [otherDrug, setOtherDrug] = useState('');
    const [notes, setNotes] = useState('');
    const [outcome, setOutcome] = useState('');
    const [followUpSched, setFollowUpSched] = useState('');
    
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const { treatmentId } = useParams();
    const navigate = useNavigate();

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

    // This useEffect hook fetches the patient data from Firebase
    useEffect(() => {
        const fetchTreatmentData = async () => {
            const docRef = doc(db, "treatmentPlan", treatmentId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                setFullName(data.fullName);
                setStatus(data.status);
                setSdateTP(data.sdateTP);
                setEdateTP(data.edateTP)
                setSdateMed(data.sdateMed)
                setEdateMed(data.edateMed)
                setDosage(data.dosage)
                setFrequency(data.frequency)
                setDuration(data.duration)
                setRegimen(data.regimen)
                setDrug(data.drug)
                setOtherDrug(data.otherDrug)
                setNotes(data.notes)
                setOutcome(data.outcome)
                setFollowUpSched(data.followUpSched)
            } else {
                console.log("No such document!");
                navigate("/TPList"); 
            }
        };

        fetchTreatmentData();
    }, [treatmentId, navigate]);

    // Function to handle form submission
    const handleSubmit = async (event) => {
        event.preventDefault();
        const treatmentData = {
            fullName,
            status,
            sdateTP,
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
            followUpSched
        };

        try {
            const docRef = doc(db, "treatmentPlan", treatmentId);
            await updateDoc(docRef, treatmentData);
            console.log("Document updated with ID: ", docRef.id);
            navigate("/TPList"); 
        } catch (e) {
            console.error("Error updating document: ", e);
        }
    };

    const handleCancel = () => {
        navigate("/TPList");
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

                <Grid container justifyContent="center" sx={{ mt: 4 }}>
                    <Button type="submit" variant="contained" sx={{ backgroundColor: colors.greenAccent[600], color: colors.grey[100], mr: 1 }}>
                        Save Information
                    </Button>
                    <Button variant="outlined" onClick={handleCancel} sx={{ color: colors.grey[100], borderColor: colors.grey[700] }}>
                        Cancel
                    </Button>
                </Grid>
            </form>
        </Container>
    );
};

export default TPEdit;
