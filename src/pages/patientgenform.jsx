import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid, TextField, FormControl, InputLabel, Select, MenuItem, Typography, Button, RadioGroup, FormControlLabel, FormHelperText, Radio, Container, Divider, Checkbox, useTheme
} from '@mui/material';
import { tokens } from "../theme";
import { db } from '../firebase.config';
import { collection, addDoc } from 'firebase/firestore';

// Sample data for dropdowns
const provinces = ["Metro Manila", "Cavite", "Laguna", "Batangas"];
const cities = ["Manila", "Quezon City", "Caloocan", "Dasmariñas"];
const barangays = ["Barangay 1", "Barangay 2", "Barangay 3", "Barangay 4"];

const PatientGenForm = ({ handleUpdatePatients }) => {
    // State hooks for patient information
    const [fullName, setFullName] = useState('');
    const [alias, setAlias] = useState('');
    const [birthdate, setBirthdate] = useState('');
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [gender, setGender] = useState('');
    const [houseNameBlockStreet, setHouseNameBlockStreet] = useState('');
    const [province, setProvince] = useState('');
    const [city, setCity] = useState('');
    const [barangay, setBarangay] = useState('');
    

    // State hooks for contact information
    const [parentName, setParentName] = useState('');
    const [parentEmail, setParentEmail] = useState('');
    const [parentContactNumber, setParentContactNumber] = useState('');
    const [relationshipToPatient, setRelationshipToPatient] = useState('');
    const [secondaryContactName, setSecondaryContactName] = useState('');
    const [secondaryContactNumber, setSecondaryContactNumber] = useState('');
    const [emergencyContactName, setEmergencyContactName] = useState('');
    const [emergencyContactNumber, setEmergencyContactNumber] = useState('');

    // Add the state hooks for medical information
    const [chestXrayAvailable, setChestXrayAvailable] = useState('');
    const [tbDrugHistory, setTbDrugHistory] = useState('');
    const [symptomsLastTwoWeeks, setSymptomsLastTwoWeeks] = useState('');

    // State to track if radio groups have been touched
    const [touched, setTouched] = useState({
        chestXrayAvailable: false,
        tbDrugHistory: false,
        symptomsLastTwoWeeks: false,
    });


    const [consent, setConsent] = useState(false);
    const [formErrors, setFormErrors] = useState({});

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    
    const navigate = useNavigate();

    const validateForm = () => {
        const errors = {};

        if (isNaN(height) || height <= 0) {
        errors.height = 'Height must be a positive number';
        }
        if (isNaN(weight) || weight <= 0) {
        errors.weight = 'Weight must be a positive number';
        }
        if (!consent) {
        errors.consent = 'You must agree to the terms';
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleCancel = () => {
                navigate("/patient_info");
            };

    const handleSubmit = async (event) => {
        event.preventDefault();
      
       // Perform validation checks
        const errors = {};
        if (!chestXrayAvailable) {
            errors.chestXrayAvailable = 'Please indicate if an annual chest x-ray is available.';
        }
        if (!tbDrugHistory) {
            errors.tbDrugHistory = 'Please indicate the TB drug history.';
        }
        if (!symptomsLastTwoWeeks) {
            errors.symptomsLastTwoWeeks = 'Please indicate if there have been any symptoms in the last two weeks.';
        }

        // Check for any errors in the form including the new radio group validations
        if (!validateForm() || Object.keys(errors).length > 0) {
            setFormErrors({ ...formErrors, ...errors });
            return; 
        }
      
        // Generate a unique case number
        const caseNumber = 'CN-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5).toUpperCase();
      
        // Get the current date and time in Philippine time
        const dateAdded = new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' });
      
        const patientData = {
          fullName,
          alias,
          birthdate,
          height,
          weight,
          gender,
          houseNameBlockStreet,
          province,
          city,
          barangay,
          consent,
          parentName,
          parentEmail,
          parentContactNumber,
          relationshipToPatient,
          secondaryContactName,
          secondaryContactNumber,
          emergencyContactName,
          emergencyContactNumber,
          chestXrayAvailable,
          tbDrugHistory,
          symptomsLastTwoWeeks,
          caseNumber, // Add the generated case number
          dateAdded,  // Add the generated date added
        };

       
        
      
        try {
            const docRef = await addDoc(collection(db, "patientsinfo"), patientData);
            console.log("Document written with ID: ", docRef.id);
        
            if (handleUpdatePatients) {
                const newPatient = { ...patientData, id: docRef.id };
                handleUpdatePatients(newPatient);
              }
              
              // Navigate back to the patient_info page
              navigate("/patient_info");
            } catch (e) {
              console.error("Error adding document: ", e);
            }
          };

    return (
        <Container component="main" maxWidth="md" sx={{
            backgroundColor: colors.blueAccent[800], 
            padding: theme.spacing(5), 
            borderRadius: theme.shape.borderRadius
        }}>
            <Typography variant="h2" gutterBottom sx={{ color: colors.white, fontWeight: 'bold' }}>
                Patient General Information
            </Typography>

            <form onSubmit={handleSubmit}>
                {/* Personal Information Section */}
                <Typography variant="h5" gutterBottom sx={{ color: colors.greenAccent[500], fontWeight: 'bold' }}>
                    Personal Information
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
                    <TextField
                        fullWidth
                        id="alias"
                        label="Alias (if applicable)"
                        name="alias"
                        variant="outlined"
                        margin="dense"
                        value={alias}
                        onChange={(e) => setAlias(e.target.value)}
                    />
                </Grid>
                <Grid item xs={3}>
                    <TextField
                        required
                        fullWidth
                        id="birthdate"
                        label="Birthdate"
                        name="birthdate"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        variant="outlined"
                        margin="dense"
                        value={birthdate}
                        onChange={(e) => setBirthdate(e.target.value)}
                    />
                </Grid>
                <Grid item xs={3}>
                    <TextField
                        required
                        fullWidth
                        id="height"
                        label="Height (cm)"
                        name="height"
                        type="number"
                        variant="outlined"
                        margin="dense"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        InputProps={{ inputProps: { min: 0, step: "0.1" } }} 
                        error={!!formErrors.height}
                        helperText={formErrors.height}
                    />
                </Grid>
                <Grid item xs={3}>
                    <TextField
                        required
                        fullWidth
                        id="weight"
                        label="Weight (kg)"
                        name="weight"
                        type="number"
                        variant="outlined"
                        margin="dense"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        InputProps={{ inputProps: { min: 0, step: "0.1" } }} 
                        error={!!formErrors.weight}
                        helperText={formErrors.weight}
                    />
                </Grid>

                <Grid item xs={3}>
                    <FormControl fullWidth margin="dense">
                        <InputLabel id="gender-label">Gender</InputLabel>
                        <Select
                            required
                            labelId="gender-label"
                            id="gender"
                            name="gender"
                            label="Gender"
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                        >
                            <MenuItem value="male">Male</MenuItem>
                            <MenuItem value="female">Female</MenuItem>
                            <MenuItem value="other">Other</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item xs={4}>
                    <TextField
                        required
                        fullWidth
                        id="houseNameBlockStreet"
                        label="House Name/Block/Street No."
                        name="houseNameBlockStreet"
                        variant="outlined"
                        margin="dense"
                        value={houseNameBlockStreet}
                        onChange={(e) => setHouseNameBlockStreet(e.target.value)}
                    />
                </Grid>
                <Grid item xs={3}>
                <FormControl fullWidth required margin="dense">
                    <InputLabel id="barangay-label">Select Barangay</InputLabel>
                    <Select
                    required
                    labelId="barangay-label"
                    id="barangay"
                    name="barangay"
                    value={barangay}
                    onChange={(e) => setBarangay(e.target.value)}
                    >
                    <MenuItem value="" ></MenuItem>
                    {barangays.map((option) => (
                        <MenuItem key={option} value={option}>{option}</MenuItem>
                    ))}
                    </Select>
                </FormControl>
                </Grid>
                <Grid item xs={2}>
                <FormControl fullWidth required margin="dense">
                    <InputLabel id="city-label">Select City</InputLabel>
                    <Select
                    labelId="city-label"
                    id="city"
                    name="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    >
                    <MenuItem value=""></MenuItem>
                    {cities.map((option) => (
                        <MenuItem key={option} value={option}>{option}</MenuItem>
                    ))}
                    </Select>
                </FormControl>
                </Grid>
                <Grid item xs={3}>
                <FormControl fullWidth required margin="dense">
                    <InputLabel id="province-label">Select Province</InputLabel>
                    <Select
                    labelId="province-label"
                    id="province"
                    name="province"
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
     
                    >
                    <MenuItem value=""></MenuItem>
                    {provinces.map((option) => (
                        <MenuItem key={option} value={option}>{option}</MenuItem>
                    ))}
                    </Select>
                </FormControl>
                </Grid>

            </Grid>
                <Divider sx={{ bgcolor: colors.grey[500], my: 2 }} />

                {/* Contact Information Section */}
                <Typography variant="h5" gutterBottom sx={{ color: colors.greenAccent[500], fontWeight: 'bold' }}>
                    Contact Information
                </Typography>
                <Grid container spacing={3}>
                    <Grid item xs={6}>
                        <TextField
                            required
                            fullWidth
                            id="parentName"
                            label="Parent/Guardian Name"
                            name="parentName"
                            variant="outlined"
                            margin="dense"
                            value={parentName}
                            onChange={(e) => setParentName(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            required
                            fullWidth
                            id="parentEmail"
                            label="Parent/Guardian Email"
                            name="parentEmail"
                            variant="outlined"
                            margin="dense"
                            value={parentEmail}
                            onChange={(e) => setParentEmail(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            required
                            fullWidth
                            id="parentContactNumber"
                            label="Parent/Guardian Contact Number"
                            name="parentContactNumber"
                            variant="outlined"
                            margin="dense"
                            value={parentContactNumber}
                            onChange={(e) => setParentContactNumber(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <FormControl fullWidth margin="dense">
                            <InputLabel id="relationship-label">Relationship to Patient</InputLabel>
                            <Select
                                required
                                labelId="relationship-label"
                                id="relationshipToPatient"
                                name="relationshipToPatient"
                                label="Relationship to Patient"
                                value={relationshipToPatient}
                                onChange={(e) => setRelationshipToPatient(e.target.value)}
                            >
                                <MenuItem value="father">Father</MenuItem>
                                <MenuItem value="mother">Mother</MenuItem>
                                <MenuItem value="sibling">Sibling</MenuItem>
                                <MenuItem value="grandparent">Grandparent</MenuItem>
                                <MenuItem value="legal_guardian">Legal Guardian</MenuItem>
                            
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            fullWidth
                            id="secondaryContactName"
                            label="Secondary Contact Name (Parent/Guardian)"
                            name="secondaryContactName"
                            variant="outlined"
                            margin="dense"
                            value={secondaryContactName}
                            onChange={(e) => setSecondaryContactName(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            fullWidth
                            id="secondaryContactNumber"
                            label="Secondary Contact Number"
                            name="secondaryContactNumber"
                            variant="outlined"
                            margin="dense"
                            value={secondaryContactNumber}
                            onChange={(e) => setSecondaryContactNumber(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            required
                            fullWidth
                            id="emergencyContactName"
                            label="Emergency Contact Name"
                            name="emergencyContactName"
                            variant="outlined"
                            margin="dense"
                            value={emergencyContactName}
                            onChange={(e) => setEmergencyContactName(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            required
                            fullWidth
                            id="emergencyContactNumber"
                            label="Emergency Contact Number"
                            name="emergencyContactNumber"
                            variant="outlined"
                            margin="dense"
                            value={emergencyContactNumber}
                            onChange={(e) => setEmergencyContactNumber(e.target.value)}
                        />
                    </Grid>
                </Grid>

                <Divider sx={{ bgcolor: colors.grey[500], my: 2 }} />

                {/* Medical Information Section */}
                <Typography variant="h5" gutterBottom sx={{ color: colors.greenAccent[500], fontWeight: 'bold' }}>
                    Medical Information
                </Typography>
                <Grid container spacing={3}>
                <Grid item xs={4}>
                    <Typography variant="body1" gutterBottom>Annual chest x-ray available:</Typography>
                    <RadioGroup
                        row
                        name="chestXrayAvailable"
                        value={chestXrayAvailable}
                        onChange={(e) => {
                        setChestXrayAvailable(e.target.value);
                        // If there is a change, clear the error for this field
                        setFormErrors({ ...formErrors, chestXrayAvailable: '' });
                        }}
                    >
                        <FormControlLabel value="yes" control={<Radio required/>} label="Yes" />
                        <FormControlLabel value="no" control={<Radio required/>} label="No" />
                    </RadioGroup>
                    {formErrors.chestXrayAvailable && (
                        <FormHelperText error>{formErrors.chestXrayAvailable}</FormHelperText>
                    )}
                    </Grid>

                    <Grid item xs={4}>
                    <Typography variant="body1" gutterBottom>History of TB drug treatment (of the child):</Typography>
                    <RadioGroup
                        row
                        name="tbDrugHistory"
                        value={tbDrugHistory}
                        onChange={(e) => {
                        setTbDrugHistory(e.target.value);
                        // If there is a change, clear the error for this field
                        setFormErrors({ ...formErrors, tbDrugHistory: '' });
                        }}
                    >
                        <FormControlLabel value="yes" control={<Radio required/>} label="Yes" />
                        <FormControlLabel value="no" control={<Radio required/>} label="No" />
                    </RadioGroup>
                    {formErrors.tbDrugHistory && (
                        <FormHelperText error>{formErrors.tbDrugHistory}</FormHelperText>
                    )}
                    </Grid>

                    <Grid item xs={4}>
                    <Typography variant="body1" gutterBottom>Experiencing symptoms in the past 2 weeks:</Typography>
                    <RadioGroup
                        row
                        name="symptomsLastTwoWeeks"
                        value={symptomsLastTwoWeeks}
                        onChange={(e) => {
                        setSymptomsLastTwoWeeks(e.target.value);
                        // If there is a change, clear the error for this field
                        setFormErrors({ ...formErrors, symptomsLastTwoWeeks: '' });
                        }}
                    >
                        <FormControlLabel value="yes" control={<Radio required/>} label="Yes" />
                        <FormControlLabel value="no" control={<Radio required/>} label="No" />
                    </RadioGroup>
                    {formErrors.symptomsLastTwoWeeks && (
                        <FormHelperText error>{formErrors.symptomsLastTwoWeeks}</FormHelperText>
                    )}
                    </Grid>


                </Grid>

            <Divider sx={{ bgcolor: colors.grey[500], my: 2 }} />

            <Grid item xs={12}>
                <FormControlLabel
                    control={
                        <Checkbox
                            required
                            checked={consent}
                            onChange={(e) => setConsent(e.target.checked)}
                            name="consentCheckbox"
                            color="primary"
                        />
                    }
                    label="Patient has signed consent form"
                />
                {formErrors.consent && (
                    <FormHelperText error>{formErrors.consent}</FormHelperText>
                )}
            </Grid>


                <Grid container justifyContent="center" sx={{ mt: 4 }}>
                    <Button type="submit" variant="contained" sx={{ backgroundColor: colors.greenAccent[600], color: colors.grey[100], mr: 1 }}>
                        Save Information
                    </Button>
                    <Button variant="outlined" onClick={handleCancel} sx={{ color: colors.grey[100], borderColor: colors.grey[700] }}>
                        Back
                    </Button>
                </Grid>
            </form>
        </Container>
    );
};

export default PatientGenForm;