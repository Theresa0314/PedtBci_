import React, { useState } from 'react';
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  TextField,
  Typography,
  Button,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase.config'; // Import your Firebase configuration


const PediatricTBSymptomsForm = () => {
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
        window.location.href = '/symptoms';
        console.log(`Row with ID ${formData.id} updated in the database`);
      } catch (error) {
        console.error('Error updating document: ', error);
        // Handle error display or logging as needed
      }
    } else {
      // If `id` doesn't exist in formData, it means we are adding a new record
      // Create a new data object with the form values
      const newData = {
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
  
      // Save the data to Firebase
      try {
        const symptomsCollection = collection(db, 'symptoms');
        const docRef = await addDoc(symptomsCollection, newData);
  
        // Update the local table data
        setTableData([...tableData, { id: docRef.id, ...newData }]);
  
        console.log(`Row with ID ${docRef.id} added to the database`);
        window.location.href = '/symptoms';
      } catch (error) {
        console.error('Error adding document: ', error);
        // Handle error display or logging as needed
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
    <div>
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
        <Grid item xs={6}>
          <FormControl component="fieldset">
            <Typography variant="subtitle1">Immunization Status:</Typography>
            <FormGroup row>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={immunizationStatus.status === 'Up-to-date'}
                    onChange={() => setImmunizationStatus({ status: 'Up-to-date', monthRange: 'Within the last 6 months', noImmunization: false })}
                    color="primary"
                  />
                }
                label="Up-to-date (Within the last 6 months)"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={immunizationStatus.status === 'Not up-to-date'}
                    onChange={() => setImmunizationStatus({ status: 'Not up-to-date', monthRange: 'More than 6 months ago', noImmunization: false })}
                    color="primary"
                  />
                }
                label="Not up-to-date (More than 6 months ago)"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={immunizationStatus.noImmunization}
                    onChange={() => setImmunizationStatus({ noImmunization: !immunizationStatus.noImmunization, status: 'No Immunization', monthRange: '' })}
                    color="primary"
                  />
                }
                label="No Immunization"
              />
            </FormGroup>
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          <FormControl component="fieldset">
            <Typography variant="subtitle1">Does your family have a history of TB?</Typography>
            <FormGroup row>
            <FormControlLabel
              control={
              <Checkbox
                checked={familyHistory.hasFamilyHistory}
                onChange={() => setFamilyHistory({ hasFamilyHistory: !familyHistory.hasFamilyHistory, family: familyHistory.family || '' })}
                color="primary"
              />
              }
               label="Yes"
            />
              {familyHistory.hasFamilyHistory && (
                <div>
                <Typography variant="subtitle1">Indicate the Family Member/s or Relative/s with TB History:</Typography>
                <TextField
                  fullWidth
                  label="Family Member/s or Relative/s"
                  variant="outlined"
                  value={familyHistory.family}
                  onChange={(e) => setFamilyHistory((prev) => ({
                  ...prev,
                  family: e.target.value,
                }))}
                  margin="normal"
                  required={familyHistory.hasFamilyHistory} // Make this required only if family history is indicated
                  disabled={!familyHistory.hasFamilyHistory} // Disable input if family history is not indicated
                />
                </div>
)}
              <FormControlLabel
                control={
                  <Checkbox
                    checked={!familyHistory.hasFamilyHistory}
                    onChange={() => setFamilyHistory({ hasFamilyHistory: false, family: '' })}
                    color="primary"
                  />
                }
                label="No"
              />
            </FormGroup>
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          <FormControl component="fieldset">
            <Typography variant="subtitle1">Close Contact with TB Patient:</Typography>
            <FormGroup row>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={closeContactWithTB}
                    onChange={() => setCloseContactWithTB(!closeContactWithTB)}
                    color="primary"
                  />
                }
                label="Yes"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={!closeContactWithTB}
                    onChange={() => setCloseContactWithTB(false)}
                    color="primary"
                  />
                }
                label="No"
              />
            </FormGroup>
          </FormControl>
        </Grid>
      </Grid>

      {/* Submit Button */}
      <Grid item xs={12} style={{ textAlign: 'center', marginTop: '20px' }}>
        <Button variant="contained" color="secondary" onClick={handleSubmit}>
          Submit
        </Button>
      </Grid>
    </div>
  );
};

export default PediatricTBSymptomsForm;
