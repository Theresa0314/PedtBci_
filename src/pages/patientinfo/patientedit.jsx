import React, { useState, useEffect } from 'react';
import {
    Box, Button, TextField, FormControl, FormLabel, InputLabel, Select, MenuItem,
    Typography, RadioGroup, FormControlLabel, Radio, Container, Divider,Grid,
    Checkbox, useTheme
  } from '@mui/material';
import { tokens } from "../../theme";
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase.config';
// ... other necessary imports

// Sample data for dropdowns
const provinces = ["Metro Manila", "Cavite", "Laguna", "Batangas"];
const cities = ["Manila", "Quezon City", "Caloocan", "Dasmariñas"];
const barangays = ["Barangay 1", "Barangay 2", "Barangay 3", "Barangay 4"];

const PatientEditForm = () => {
    const { patientId } = useParams();
    const navigate = useNavigate();
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    // useState hooks for form fields
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
    const [consent, setConsent] = useState(false); // Assuming consent is a boolean
    const [parentName, setParentName] = useState('');
    const [parentEmail, setParentEmail] = useState('');
    const [parentContactNumber, setParentContactNumber] = useState('');
    const [relationshipToPatient, setRelationshipToPatient] = useState('');
    const [secondaryContactName, setSecondaryContactName] = useState('');
    const [secondaryContactEmail, setSecondaryContactEmail] = useState('');
    const [secondaryContactNumber, setSecondaryContactNumber] = useState('');
    const [emergencyContactName, setEmergencyContactName] = useState('');
    const [emergencyContactNumber, setEmergencyContactNumber] = useState('');
    const [secondaryRelationshipToPatient, setSecondaryRelationshipToPatient] = useState('');
    const [chestXrayAvailable, setChestXrayAvailable] = useState(''); // Assuming this is a string like 'yes' or 'no'
    const [tbDrugHistory, setTbDrugHistory] = useState(''); // Same as above
    const [symptomsLastTwoWeeks, setSymptomsLastTwoWeeks] = useState(''); // Same as above


    // This useEffect hook fetches the patient data from Firebase
    useEffect(() => {
        const fetchPatientData = async () => {
            const docRef = doc(db, "patientsinfo", patientId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                setFullName(data.fullName);
                setAlias(data.alias);
                setBirthdate(data.birthdate);
                setHeight(data.height);
                setWeight(data.weight);
                setGender(data.gender);
                setHouseNameBlockStreet(data.houseNameBlockStreet);
                setProvince(data.province);
                setCity(data.city);
                setBarangay(data.barangay);
                setConsent(data.consent);
                setParentName(data.parentName);
                setParentEmail(data.parentEmail);
                setParentContactNumber(data.parentContactNumber);
                setRelationshipToPatient(data.relationshipToPatient);
                setSecondaryContactName(data.secondaryContactName);
                setSecondaryContactEmail(data.secondaryContactEmail);
                setSecondaryContactNumber(data.secondaryContactNumber);
                setEmergencyContactName(data.emergencyContactName);
                setEmergencyContactNumber(data.emergencyContactNumber);
                setSecondaryRelationshipToPatient(data.secondaryRelationshipToPatient);
                setChestXrayAvailable(data.chestXrayAvailable);
                setTbDrugHistory(data.tbDrugHistory);
                setSymptomsLastTwoWeeks(data.symptomsLastTwoWeeks);
                // ... set the rest of your state variables with the fetched data
            } else {
                console.log("No such document!");
                navigate("/patientinfo"); // or show an error message
            }
        };

        fetchPatientData();
    }, [patientId, navigate]);

    // Function to handle form submission
    const handleSubmit = async (event) => {
        event.preventDefault();
        // ... form validation and data gathering

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
            secondaryContactEmail,
            secondaryContactNumber,
            emergencyContactName,
            emergencyContactNumber,
            secondaryRelationshipToPatient,
            chestXrayAvailable,
            tbDrugHistory,
            symptomsLastTwoWeeks,
        };

        try {
            const docRef = doc(db, "patientsinfo", patientId);
            await updateDoc(docRef, patientData);
            console.log("Document updated with ID: ", docRef.id);
            navigate("/patientinfo"); // Redirect to the patient info page
        } catch (e) {
            console.error("Error updating document: ", e);
        }
    };

    const handleCancel = () => {
        navigate("/patientInfo");
    };

    return (
        <Container component="main" maxWidth="md">
        <Typography variant="h4" component="h1" gutterBottom>
          Edit Patient General Information
        </Typography>
        <Divider sx={{ mb: 4 }} />

        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>

        <Typography variant="h5" gutterBottom sx={{ color: colors.greenAccent[500], fontWeight: 'bold' }}>
        Personal Information
        </Typography>
          <Grid container spacing={3}>
            {/* Personal Information Fields */}

            <Grid item xs={12} md={6}>
                <TextField
                required
                fullWidth
                label="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                variant="outlined"
                />
            </Grid>
            <Grid item xs={12} md={6}>
                <TextField
                fullWidth
                label="Alias (if applicable)"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                variant="outlined"
                />
            </Grid>
            <Grid item xs={12} md={5}>
                <TextField
                required
                fullWidth
                label="Birthdate"
                type="date"
                value={birthdate}
                onChange={(e) => setBirthdate(e.target.value)}
                variant="outlined"
                InputLabelProps={{
                    shrink: true,
                }}
                />
            </Grid>
            <Grid item xs={6} md={2}>
                <TextField
                required
                fullWidth
                label="Height (cm)"
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                variant="outlined"
                />
            </Grid>
            <Grid item xs={6} md={2}>
                <TextField
                required
                fullWidth
                label="Weight (kg)"
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                variant="outlined"
                />
            </Grid>
            <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                <InputLabel id="gender-label">Gender*</InputLabel>
                <Select
                    labelId="gender-label"
                    id="gender"
                    value={gender}
                    label="Gender*"
                    onChange={(e) => setGender(e.target.value)}
                >
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                </Select>
                </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
                <TextField
                required
                fullWidth
                label="House Name/Block/Street No."
                value={houseNameBlockStreet}
                onChange={(e) => setHouseNameBlockStreet(e.target.value)}
                variant="outlined"
                />
            </Grid>
            <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
                <InputLabel id="barangay-label">Select Barangay*</InputLabel>
                <Select
                labelId="barangay-label"
                id="barangay"
                value={barangay}
                label="Select Barangay"
                onChange={(e) => setBarangay(e.target.value)}
                >
                {barangays.map((barangay, index) => (
                    <MenuItem key={index} value={barangay}>
                    {barangay}
                    </MenuItem>
                ))}
                </Select>
            </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
                <InputLabel id="city-label">Select City*</InputLabel>
                <Select
                labelId="city-label"
                id="city"
                value={city}
                label="Select City"
                onChange={(e) => setCity(e.target.value)}
                >
                {cities.map((city, index) => (
                    <MenuItem key={index} value={city}>
                    {city}
                    </MenuItem>
                ))}
                </Select>
            </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
                <InputLabel id="province-label">Select Province*</InputLabel>
                <Select
                labelId="province-label"
                id="province"
                value={province}
                label="Select Province"
                onChange={(e) => setProvince(e.target.value)}
                >
                {provinces.map((province, index) => (
                    <MenuItem key={index} value={province}>
                    {province}
                    </MenuItem>
                ))}
                </Select>
            </FormControl>
            </Grid>
          </Grid>

            <Divider sx={{ bgcolor: colors.grey[500], my: 2 }} />
            {/* Contact Information Fields */}
            <Typography variant="h5" gutterBottom sx={{ color: colors.greenAccent[500], fontWeight: 'bold' }}>
            Contact Information
            </Typography>
            <Grid container spacing={1}>
            <Grid item xs={12} md={6}>
             <TextField
                required
                fullWidth
                label="Parent/Guardian Name"
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                variant="outlined"
                margin="normal"
                />
            </Grid>
            <Grid item xs={12} md={6}>
                <TextField
                required
                fullWidth
                label="Parent/Guardian Email"
                value={parentEmail}
                onChange={(e) => setParentEmail(e.target.value)}
                variant="outlined"
                margin="normal"
                />
            </Grid>
            <Grid item xs={12} md={6}>
                <TextField
                required
                fullWidth
                label="Parent/Guardian Contact Number"
                value={parentContactNumber}
                onChange={(e) => setParentContactNumber(e.target.value)}
                variant="outlined"
                margin="normal"
                />
            </Grid>
            <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                <InputLabel id="relationship-to-patient-label">Relationship to Patient</InputLabel>
                <Select
                    labelId="relationship-to-patient-label"
                    id="relationshipToPatient"
                    value={relationshipToPatient}
                    label="Relationship to Patient"
                    onChange={(e) => setRelationshipToPatient(e.target.value)}
                >
                    <MenuItem value="father">Father</MenuItem>
                    <MenuItem value="mother">Mother</MenuItem>
                    <MenuItem value="sibling">Sibling</MenuItem>
                    <MenuItem value="grandparent">Grandparent</MenuItem>
                    <MenuItem value="legal_guardian">Legal Guardian</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                </Select>
                </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
                <TextField
                fullWidth
                label="Secondary Contact Name (Parent/Guardian)"
                value={secondaryContactName}
                onChange={(e) => setSecondaryContactName(e.target.value)}
                variant="outlined"
                margin="normal"
                />
            </Grid>
            <Grid item xs={12} md={6}>
                <TextField
                fullWidth
                label="Secondary Contact Email"
                value={secondaryContactEmail}
                onChange={(e) => setSecondaryContactEmail(e.target.value)}
                variant="outlined"
                margin="normal"
                />
            </Grid>
            <Grid item xs={12} md={6}>
                <TextField
                fullWidth
                label="Secondary Contact Number"
                value={secondaryContactNumber}
                onChange={(e) => setSecondaryContactNumber(e.target.value)}
                variant="outlined"
                margin="normal"
                />
            </Grid>
            <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                <InputLabel id="secondary-relationship-to-patient-label">Relationship to Patient</InputLabel>
                <Select
                    labelId="secondary-relationship-to-patient-label"
                    id="secondaryRelationshipToPatient"
                    value={secondaryRelationshipToPatient}
                    label="Relationship to Patient"
                    onChange={(e) => setSecondaryRelationshipToPatient(e.target.value)}
                >
                    <MenuItem value="father">Father</MenuItem>
                    <MenuItem value="mother">Mother</MenuItem>
                    <MenuItem value="sibling">Sibling</MenuItem>
                    <MenuItem value="grandparent">Grandparent</MenuItem>
                    <MenuItem value="legal_guardian">Legal Guardian</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                </Select>
                </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
                <TextField
                required
                fullWidth
                label="Emergency Contact Name"
                value={emergencyContactName}
                onChange={(e) => setEmergencyContactName(e.target.value)}
                variant="outlined"
                margin="normal"
                />
            </Grid>
            <Grid item xs={12} md={6}>
                <TextField
                required
                fullWidth
                label="Emergency Contact Number"
                value={emergencyContactNumber}
                onChange={(e) => setEmergencyContactNumber(e.target.value)}
                variant="outlined"
                margin="normal"
                />
            </Grid>
            </Grid>

            <Divider sx={{ bgcolor: colors.grey[500], my: 2 }} />
            {/* Medical Information Fields */}
            <Typography variant="h5" gutterBottom sx={{ color: colors.greenAccent[500], fontWeight: 'bold' }}>
            Medical Information
            </Typography>
            <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
                <FormControl component="fieldset">
                <FormLabel component="legend">Annual chest x-ray available:</FormLabel>
                <RadioGroup
                    row
                    name="chestXrayAvailable"
                    value={chestXrayAvailable}
                    onChange={(e) => setChestXrayAvailable(e.target.value)}
                >
                    <FormControlLabel value="yes" control={<Radio required />} label="Yes" />
                    <FormControlLabel value="no" control={<Radio required />} label="No" />
                </RadioGroup>
                </FormControl>
            </Grid>

            <Grid item xs={12} sm={4}>
                <FormControl component="fieldset">
                <FormLabel component="legend">History of TB drug treatment (of the child):</FormLabel>
                <RadioGroup
                    row
                    name="tbDrugHistory"
                    value={tbDrugHistory}
                    onChange={(e) => setTbDrugHistory(e.target.value)}
                >
                    <FormControlLabel value="yes" control={<Radio required />} label="Yes" />
                    <FormControlLabel value="no" control={<Radio required />} label="No" />
                </RadioGroup>
                </FormControl>
            </Grid>

            <Grid item xs={12} sm={4}>
                <FormControl component="fieldset">
                <FormLabel component="legend">Experiencing symptoms in the past 2 weeks:</FormLabel>
                <RadioGroup
                    row
                    name="symptomsLastTwoWeeks"
                    value={symptomsLastTwoWeeks}
                    onChange={(e) => setSymptomsLastTwoWeeks(e.target.value)}
                >
                    <FormControlLabel value="yes" control={<Radio required />} label="Yes" />
                    <FormControlLabel value="no" control={<Radio required />} label="No" />
                </RadioGroup>
                </FormControl>
            </Grid>
            </Grid>

        {/* Action Buttons */}
        <Grid container justifyContent="center" sx={{ mt: 4 }}>
            <Button type="submit" variant="contained" 
            sx={{ backgroundColor: colors.greenAccent[600], color: colors.grey[100], mr: 1 }}>
              Save Information
            </Button>

            <Button variant="outlined" onClick={handleCancel} 
            sx={{ color: colors.grey[100], borderColor: colors.grey[700] }}>
            Back
            </Button>
            </Grid>

        </Box>
      </Container>
    );
};

export default PatientEditForm;
