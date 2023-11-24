import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid, TextField, FormControl, InputLabel, Select, MenuItem, Typography, Button, RadioGroup, FormControlLabel, FormHelperText, Radio, Container, Divider, Checkbox, useTheme, Input
} from '@mui/material';
import { tokens } from "../theme";
import { db } from '../firebase.config';
import { collection, addDoc } from 'firebase/firestore';

// Sample data for dropdowns
const location = ["Lung Center of the Philippines", "Philippine General Hospital", "St. Lukes Medical Center - Global City"];
const result = ["With signs of TB", "No signs", "Undetermined"];

const IGRAGenForm = () => {
    // State hooks for igra information
    const [testDate, setTestDate] = useState('');
    const [referenceNumber, setReferenceNumber] = useState('');
    const [testLocation, setTestLocation] = useState('');
    const [testResult, setTestResult] = useState('');
    const [validity, setValidity] = useState('');
    
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const navigate = useNavigate();

    const handleCancel = () => {
        navigate("/patient_info");
    };

    const handleSubmit = () =>{
        console.log("Hello");
    }

    const handleFileChange = (e) => {
        // Handle file upload logic here
        // You can use e.target.files to access the selected file(s)
    };

    const style = {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "100%", // Use a percentage to make it responsive
        maxWidth: 1000, // You can also set a maxWidth
        bgcolor: "background.paper",
        boxShadow: 20,
        p: 4,
        borderRadius: 2, // Optional: if you want rounded corners
      };


    

    return ( 
    <Container component="main" maxWidth="md" sx={{
        backgroundColor: colors.blueAccent[800], 
        padding: theme.spacing(5), 
        borderRadius: theme.shape.borderRadius
    }}>
        <Typography variant="h2" gutterBottom sx={{ color: colors.white, fontWeight: 'bold' }}>
            Add IGRA Information
        </Typography>

        <form onSubmit={handleSubmit}>
            {/* Personal Information Section */}
            <Grid container spacing={5}>
            <Grid item xs={6}>
                <FormControl fullWidth margin="dense">
                    <InputLabel id="testLocation">Issued By:</InputLabel>
                    <Select
                    required
                    labelId="testLocation"
                    id="testLocation"
                    name="testLocation"
                    label="Test Location"
                    value={testLocation}
                    onChange={(e) => setTestLocation(e.target.value)}
                    >
                    {location.map((item) => (
                        <MenuItem key={item} value={item}>
                        {item}
                        </MenuItem>
                    ))}
                    </Select>
                </FormControl>
            </Grid>
            <Grid item xs={6}>
                <TextField
                    required
                    fullWidth
                    id="testDate"
                    label="Issued On:"
                    name="testDate"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    variant="outlined"
                    margin="dense"
                    value={testDate}
                    onChange={(e) => setTestDate(e.target.value)}
                />
            </Grid>
            <Grid item xs={6}>
                <TextField
                    required
                    fullWidth
                    id="referenceNumber"
                    label="Reference Number"
                    name="referenceNumber"
                    variant="outlined"
                    margin="dense"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                />
            </Grid>
            <Grid item xs={6}>
                <FormControl fullWidth margin="dense">
                    <InputLabel id="testResult">IGRA Test Result</InputLabel>
                    <Select
                    required
                    labelId="testResult"
                    id="testResult"
                    name="testResult"
                    label="IGRA Test Result"
                    value={testResult}
                    onChange={(e) => setTestResult(e.target.value)}
                    >
                    {result.map((item) => (
                        <MenuItem key={item} value={item}>
                        {item}
                        </MenuItem>
                    ))}
                    </Select>
                </FormControl>
            </Grid>
            <Grid item xs={12}>
            <InputLabel htmlFor="validity" sx={{ color: colors.white }}>
                Upload IGRA File Attachment
                </InputLabel>
                <Input
                    required
                    fullWidth
                    id="validity"
                    type="file"
                    inputProps={{ accept: '.pdf, .doc, .docx, .jpg, .jpeg, .png' }} // Specify accepted file types
                    onChange={handleFileChange}
                    sx={{ display: 'none' }} // Hide the default input style
                />
                <label htmlFor="validity">
                <Button
                    style={{ color: "white", width: "100%" }}
                    sx={{ mt: 1, borderColor: "rgba(255, 255, 255, 0.3)", height: "50px", "&:hover": {
                        borderColor: "white",
                    }, }}
                    component="span"
                    variant="outlined"
                >
                    Upload File
                </Button>

                </label>
            
            </Grid>
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
    </Container> );
}
 
export default IGRAGenForm;