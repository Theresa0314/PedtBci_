import React, { useState } from 'react';
import {
  Checkbox,
  Container,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  TextField,
  Typography,
  Button,
  useTheme,
  Radio, RadioGroup
} from '@mui/material';
import { tokens } from "../theme";
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, updateDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase.config'; // Import your Firebase configuration


const PediatricTBSymptomsForm = () => {

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // State to manage symptom checkboxes
  const [symptoms, setSymptoms] = useState({
    PersistentCough: false,
    Fever: false,
    WeightLoss: false,
    PoorAppetite: false,
    Fatigue: false,
    NightSweats: false,
    ChestPain: false,
    BreathingDifficulty: false,
    CoughingUpBlood: false,
  });

  // State for other remarks and relevant fields
  const [otherSymptoms, setOtherSymptoms] = useState('');
  const [immunizationStatus, setImmunizationStatus] = useState({
    status: '',
    monthRange: '',
    noImmunization: false,
  });
  const [familyHistory, setFamilyHistory] = useState({
    hasFamilyHistory: false,
    family: '',
  });
  const [closeContactWithTB, setCloseContactWithTB] = useState(false);
  const [symptomsReviewDate, setSymptomsReviewDate] = useState('');

  const navigate = useNavigate();


  // Handler for updating symptom checkboxes
  const handleSymptomChange = (symptom) => {
    setSymptoms((prevSymptoms) => ({
      ...prevSymptoms,
      [symptom]: !prevSymptoms[symptom],
    }));
  };

  const [formData, setFormData] = useState({
    id: '',
    symptomsReviewDate: '',
    symptoms: '',
    otherSymptoms: '',
    immunizationStatus: '',
    familyHistory: '',
    family: '',
    closeContactWithTB: '',
  });

  // State for table data
  const [tableData, setTableData] = useState([]);

  // Function to generate a random ID
const generateRandomID = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let result = 'A-';
  for (let i = 0; i < 10; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

  // Handler for form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
  
    // Perform validation checks
    const errors = {};
    if (!symptomsReviewDate) {
      errors.symptomsReviewDate = 'Please select a Symptoms Review Date.';
    }
    // Add more validation checks as needed
  
    // Check for any errors in the form
    if (Object.keys(errors).length > 0) {
      console.error('Please fix the following errors:', errors);
      // Handle error display or logging as needed
      return;
    }
  
    // Check if it's an edit or add operation
    if (formData.id) {
      // If `id` exists in formData, it means we are editing an existing record
      try {
        // Update the document in the database
        await updateDoc(doc(db, 'symptoms', formData.id), formData);
  
        // Update the local table data
        setTableData((prevData) => {
          const updatedData = prevData.map((row) =>
            row.id === formData.id ? { ...row, ...formData } : row
          );
          return updatedData;
        });
        console.log(`Row with ID ${formData.id} updated in the database`);
      } catch (error) {
        console.error('Error updating document: ', error);
        // Handle error display or logging as needed
      }
    } else {
      const newID = generateRandomID();
      const newData = {
        id: newID,
        symptomsReviewDate,
        symptoms: { ...symptoms },
        otherSymptoms,
        immunizationStatus,
        familyHistory,
        familyHistory: {
          hasFamilyHistory: familyHistory.hasFamilyHistory,
          family: familyHistory.hasFamilyHistory ? familyHistory.family : ''},
        closeContactWithTB,
      };
  
      // Use the setDoc function to create a new document with a custom ID
      try {
        await setDoc(doc(db, 'symptoms', newID), newData); // Use the custom ID as the document reference
        console.log(`New record with ID ${newID} added to the database`);
  
        // Update the local table data
        setTableData([...tableData, { ...newData, id: newID }]);
        // This is where the page will be refreshed, after a new record is added
      window.location.reload(); 
  
        // Redirect or handle the UI update
      } catch (error) {
        console.error('Error adding document: ', error);
      }
    }
  
    // Clear the form data
    setFormData({
      id: '',
      symptomsReviewDate: '',
      symptoms: '',
      otherSymptoms: '',
      immunizationStatus: '',
      familyHistory: '',
      family: '',
      closeContactWithTB: '',
    });
  };
  

  return (
    <Container component="main" maxWidth="md" sx={{
      backgroundColor: colors.blueAccent[800], 
      padding: theme.spacing(6), 
      borderRadius: theme.shape.borderRadius
  }}>
    <div style={{ textAlign: 'center' }}>
      <h1>Pediatric TB - Symptoms Review</h1>
    </div>
      <Typography variant="h6">
        Symptoms Review Date:
      </Typography>
       <TextField
        type="date"
        fullWidth
        variant="outlined"
        value={symptomsReviewDate}
        onChange={(e) => setSymptomsReviewDate(e.target.value)}
        required
      /> 

      <Grid container spacing={2} style={{ marginTop: '20px' }}>
        {/* Symptom Checkboxes */}
        <Grid item xs={12}>
          <FormControl component="fieldset">
            <Typography variant="subtitle1">Check if patient is experiencing the following:</Typography>
            <FormGroup row>
              {Object.entries(symptoms).map(([symptom, checked]) => (
                <FormControlLabel
                  key={symptom}
                  control={
                    <Checkbox
                      checked={checked}
                      onChange={() => handleSymptomChange(symptom)}
                      color="primary"
                    />
                  }
                  label={symptom.replace(/([a-z])([A-Z])/g, '$1 $2')} // Convert camelCase to spaced words
                  required
                />
              ))}
            </FormGroup>
          </FormControl>
        </Grid>

        {/* Other Remarks */}
        <Grid item xs={12}>
        <Typography variant="subtitle1">Other Symptoms: </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Other Symptoms or Remarks(Type N/A if none)"
            variant="outlined"
            value={otherSymptoms}
            onChange={(e) => setOtherSymptoms(e.target.value)}
            margin="normal"
            required
          />
        </Grid>

        {/* Additional Relevant Fields */}
        <Grid item xs={12}>
        <FormControl component="fieldset">
            <Typography variant="subtitle1">Immunization Status:</Typography>
            <RadioGroup
              row
              aria-label="immunizationStatus"
              name="immunizationStatus"
              value={immunizationStatus.status}
              onChange={(e) => setImmunizationStatus({
                ...immunizationStatus,
                status: e.target.value,
                noImmunization: e.target.value === 'No Immunization',
              })}
            >
              <FormControlLabel
                value="Up-to-date"
                control={<Radio color="primary" />}
                label="Up-to-date (Within the last 6 months)"
              />
              <FormControlLabel
                value="Not up-to-date"
                control={<Radio color="primary" />}
                label="Not up-to-date (More than 6 months ago)"
              />
              <FormControlLabel
                value="No Immunization"
                control={<Radio color="primary" />}
                label="No Immunization"
              />
            </RadioGroup>
          </FormControl>
        </Grid>
        <Grid item xs={6}>
        <FormControl component="fieldset">
          <Typography variant="subtitle1">Does your family have a history of TB?</Typography>
          <RadioGroup
            row
            aria-label="familyHistory"
            name="familyHistory"
            value={familyHistory.hasFamilyHistory.toString()}
            onChange={(event) => {
              const hasHistory = event.target.value === 'true';
              setFamilyHistory({
                hasFamilyHistory: hasHistory,
                family: hasHistory ? familyHistory.family : ''
              });
            }}
          >
            <FormControlLabel
              value="true"
              control={<Radio color="primary" />}
              label="Yes"
            />
            <FormControlLabel
              value="false"
              control={<Radio color="primary" />}
              label="No"
            />
          </RadioGroup>
          {familyHistory.hasFamilyHistory && (
            <TextField
              fullWidth
              label="Indicate the Family Member/s or Relative/s with TB History"
              variant="outlined"
              value={familyHistory.family}
              onChange={(e) => setFamilyHistory((prev) => ({
                ...prev,
                family: e.target.value,
              }))}
              margin="normal"
            />
          )}
        </FormControl>

        </Grid>
        <Grid item xs={6}>
        <FormControl component="fieldset">
          <Typography variant="subtitle1">Close Contact with TB Patient:</Typography>
          <RadioGroup
            row
            aria-label="closeContactWithTB"
            name="closeContactWithTB"
            value={closeContactWithTB.toString()}
            onChange={(event) => setCloseContactWithTB(event.target.value === 'true')}
          >
            <FormControlLabel
              value="true"
              control={<Radio color="primary" />}
              label="Yes"
            />
            <FormControlLabel
              value="false"
              control={<Radio color="primary" />}
              label="No"
            />
          </RadioGroup>
        </FormControl>

        </Grid>
      </Grid>

      {/* Submit Button */}
      <Grid item xs={12} style={{ textAlign: 'center', marginTop: '20px' }}>
        <Button variant="contained" color="secondary" onClick={handleSubmit}>
          Submit
        </Button>
      </Grid>
    </Container>
  );
};

export default PediatricTBSymptomsForm;
