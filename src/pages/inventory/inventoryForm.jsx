import React, { useState } from 'react';
import {
  Grid, TextField, Typography, Button, Container, Divider,  useTheme
} from '@mui/material';
import { tokens } from "../../theme";
import { db } from '../../firebase.config';
import { collection, addDoc } from 'firebase/firestore';

const InvForm = ({ handleCloseForm, handleUpdateMed }) => {
    // State hooks
    const [name, setName] = useState('');
    const [acronym, setAcronym] = useState('');
    const [quantity, setQuantity] = useState('');
    const [formErrors, setFormErrors] = useState({});

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    
    const handleSubmit = async (event) => {
        event.preventDefault();
      
        // Generate a unique case number
        const caseNumber = 'CN-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5).toUpperCase();
      
        // Get the current date and time in Philippine time
        const dateAdded = new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' });
      
        const InvData = {
          name,
          acronym,
          quantity,
          caseNumber, // Add the generated case number
          dateAdded  // Add the generated date added
        };
      
        try {
            const docRef = await addDoc(collection(db, "inventory"), InvData);
            console.log("Document written with ID: ", docRef.id);
        
            const newInv = { ...InvData, id: docRef.id };
            handleUpdateMed(newInv); // Update the Treatment Plan list in the parent component
            
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
                Medication Information
            </Typography>

            <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
                <Grid item xs={6}>
                    <TextField
                        required
                        fullWidth
                        id="name"
                        label="Drug Name"
                        name="name"
                        variant="outlined"
                        margin="dense"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </Grid>
                <Grid item xs={6}>
                    <TextField
                        fullWidth
                        id="acronym"
                        label="Drug Acronym"
                        name="acronym"
                        variant="outlined"
                        margin="dense"
                        value={acronym}
                        onChange={(e) => setAcronym(e.target.value)}
                    />
                </Grid>
                <Grid item xs={6}>
                    <TextField
                        required
                        fullWidth
                        id="quantity"
                        label="Quantity"
                        name="quantity"
                        type="number"
                        variant="outlined"
                        margin="dense"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        InputProps={{ inputProps: { min: 0, step: "1" } }} 
                    />
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

export default InvForm;