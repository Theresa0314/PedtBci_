import React, { useState, useEffect } from 'react';
import {
  Grid, FormControl, InputLabel, Select, MenuItem, Typography, Button, Container, useTheme, Divider 
//TextField,
} from '@mui/material';
import { tokens } from "../../theme";
import { db } from '../../firebase.config';
import { doc, collection, getDoc, addDoc } from 'firebase/firestore';

// Sample data for dropdowns
const regimens = ["I. 2HRZE/4HR", "Ia. 2HRZE/10HR", "II. 2HRZES/1HRZE/5HRE", "IIa. 2HRZES/1HRZE/9HRE"];
//const statuses = ["Ongoing", "End"];
//const outcomes = ["Cured/Treatment Completed", "Treatment Failed", "Died", "Lost to Follow up", "Not Evaluated"];

const TPForm = ({ handleCloseForm, handleUpdateTP, caseId, caseNumber }) => {
   // State hooks for form data
   const [regimen, setRegimen] = useState('');

  // New state hook for startDate
  // const [startDate, setStartDate] = useState('');

  //  // Fetch case start date when the component mounts or when caseId changes (?)
  //  useEffect(() => {
  //   const fetchStartDate = async () => {

  //     const docRef = doc(db, 'cases', caseId);
  //     const docSnap = await getDoc(docRef);
      
  //     if (docSnap.exists()) {
  //       setStartDate(docSnap.data().startDate); 
  //       console.log('No such case!');
  //     }
  //   };

  //   fetchStartDate();
  // }, [caseId]);

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const treatmentDurations = {
        "I. 2HRZE/4HR": 6,
        "Ia. 2HRZE/10HR": 12,
        "II. 2HRZES/1HRZE/5HRE": 7,
        "IIa. 2HRZES/1HRZE/9HRE": 11,
      };

      const treatmentMedications = {
        "I. 2HRZE/4HR": ["[H] Isoniazid, ", "[R] Rifampicin, ", "[Z] Pyrazinamide, ", "[E] Ethambutol"],
        "Ia. 2HRZE/10HR": ["[H] Isoniazid, ", "[R] Rifampicin, ", "[Z] Pyrazinamide, ", "[E] Ethambutol"],
        "II. 2HRZES/1HRZE/5HRE": ["[H] Isoniazid, ", "[R] Rifampicin, ", "[Z] Pyrazinamide, ", "[E] Ethambutol, ", "[S] Streptomycin"], 
        "IIa. 2HRZES/1HRZE/9HRE": ["[H] Isoniazid, ", "[R] Rifampicin, ", "[Z] Pyrazinamide, ", "[E] Ethambutol, ", "[S] Streptomycin"],
      };
      //start date of treatment plan
      const startDateTP = new Date().toLocaleDateString();
      const duration = treatmentDurations[regimen]; // duration in months
      const medication = treatmentMedications[regimen];

      //calculate new month number
      const dateObject = new Date(startDateTP);
      const monthNumber = dateObject.getMonth();
      const newMonthNumber = monthNumber + duration;
      //adjust year if new month exceeds Dec
      const newYear = dateObject.getFullYear() + Math.floor(newMonthNumber / 12);
      const newMonth = newMonthNumber % 12;

      //end date
      const endDateTP = new Date(newYear, newMonth, dateObject.getDate()).toLocaleDateString();
      
      //follow up schedules 
      const calculateFollowUpDates = () => {

        const followUpDates = [];
        let currentDate = new Date(startDateTP);
        let endDate = new Date(endDateTP);
       
        currentDate.setDate(currentDate.getDate() + 14); // Start two weeks after the initial start date

        while (currentDate <= endDate) {
          followUpDates.push(new Date(currentDate));
          currentDate.setDate(currentDate.getDate() + 14); // Add 2 weeks
        }
     
        return followUpDates;
      };
    
      const followUpDates = calculateFollowUpDates();

    const handleSubmit = async (event) => {
        event.preventDefault();

        const TPData = {
          caseId, // Directly used from props
          caseNumber, // Directly used from props
          regimen,
          startDateTP,
          endDateTP,
          duration,
          medication,
          followUpDates,
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
                    Treatment Plan Information
                </Typography>
                <Grid container spacing={3}>

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
                <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                    <strong>Duration:</strong> {duration} <light> months</light>
                 </Typography>
                </Grid>

                <Grid item xs={3}>
                <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                    <strong>Start Date:</strong> {startDateTP}
                 </Typography>
                </Grid>

                <Grid item xs={3}>
                <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                <strong>End Date:</strong> {endDateTP}
                 </Typography>
                </Grid>

                <Grid item xs={3}>
                <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                    <strong>Medications: </strong> {medication}
                 </Typography>
                </Grid>

                <Grid item xs={3}>
                <Typography variant="body1" sx={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                    <strong>Follow-Up Dates: </strong>
                 </Typography>
                 <ul>
                        {followUpDates.map((date, index) => (
                        <li  key={index}>{date.toLocaleDateString()}</li >
                        ))}
                    </ul>
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
                </Grid>
            </form>
        </Container>
    );
};

export default TPForm;