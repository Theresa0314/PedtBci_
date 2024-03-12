import React, { useState } from 'react'
import { auth, apiCalendar } from '../../firebase.config';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';

import * as yup from "yup";
import {Button, TextField, Grid,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  Container, Typography, useTheme } from "@mui/material";
import { collection, query, where, getDocs, getDoc, doc} from "firebase/firestore";
import { db, config } from '../../firebase.config';
import { Formik, ErrorMessage } from "formik";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { usePatientInfo } from '../../PatientInfoContext';
import GoogleIcon from '@mui/icons-material/Google';

const Login = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [openChildDialog, setOpenChildDialog] = useState(false);

    // Add state for child's name and birthdate
  const [childName, setChildName] = useState('');
  const [childBirthdate, setChildBirthdate] = useState('');
  const [error, setError] = useState('');

  const { setPatientInfoId } = usePatientInfo();
  const navigate = useNavigate();
  
  const handleGoogleSubmit = async () => {
     try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;
      localStorage.setItem('token', user.accessToken);
      localStorage.setItem('user', JSON.stringify(user));
      
        await apiCalendar.handleAuthClick();
      
      // Fetch the user's role from the database
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        // Check if the role is Parent and open the dialog
        if (userData.role === "Parent") {
          setOpenChildDialog(true);
        } else {
          navigate("/"); // Redirect non-parent users to dashboard
        }
      } else {
        console.error("User document not found!");
      }
    } catch (error) {
      console.error(error);
    }
  }
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      localStorage.setItem('token', user.accessToken);
      localStorage.setItem('user', JSON.stringify(user));
      // Fetch the user's role from the database
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        // Check if the role is Parent and open the dialog
        if (userData.role === "Parent") {
          setOpenChildDialog(true);
        } else {
          navigate("/"); // Redirect non-parent users to dashboard
        }
      } else {
        console.error("User document not found!");
      }
    } catch (error) {
      console.error(error);
  
    }
  };
  
  // This function gets called when the parent submits the case number
  const handleParentLogin = async () => {
  setError(''); // Clear any existing errors
  const childQuery = query(
      collection(db, "patientsinfo"),
      where("fullName", "==", childName),
      where("birthdate", "==", childBirthdate)
    );
    const querySnapshot = await getDocs(childQuery);
    if (!querySnapshot.empty) {
      const patientDoc = querySnapshot.docs[0];
      setPatientInfoId(patientDoc.id); // Update the context with the patient info ID
      navigate(`/patientinfo/${patientDoc.id}`);
      setOpenChildDialog(false);
    } else {
      setError("No records found with the provided child's name and birthdate.");
      // Here you can set an error state and display it to the user
    }
  };
  


  return (
<Container 
  component="main" 
  maxWidth="sm" sx={{
  backgroundColor: colors.blueAccent[800], 
  padding: theme.spacing(6), 
  borderRadius: theme.shape.borderRadius
}}><Header title="LOG IN" subtitle="Login User" />

      <Formik
        onSubmit={handleSubmit}
        validationSchema={validationSchema}
        className='login-form'
      >
        <form onSubmit={handleSubmit}>
        <Grid container spacing={5} direction="column" >
          <Grid item xs={6}>
            {/* email */}
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Email*"
                name="email"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                helperText={<ErrorMessage name="password" />}
                sx={{ gridColumn: "span 4" }}
              />
            </Grid>

            <Grid item xs={6}>
              {/* password */}
              <TextField
                fullWidth
                variant="filled"
                type="password"
                label="Password*"
                name="password"
                helperText={<ErrorMessage name="password" />}
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                sx={{ gridColumn: "span 4" }}/>
              </Grid>
            </Grid>
            {/* google button */}
            <Grid container justifyContent="right" sx={{ mt: 4 }}>
            <Button type="submit" color="primary" variant="contained" startIcon={<GoogleIcon />} onClick={handleGoogleSubmit}>
                Continue with Google
              </Button>
            </Grid>
            {/* submit button */}
            <Grid container justifyContent="right"sx={{ mt: 4 }}>
            <Button type="submit" color="secondary" variant="contained" >
                LOGIN
              </Button>

            </Grid>

          </form>
      </Formik>
      <div style={{ width: '100%', marginTop: '5vh' }}>
      <p className="forget" style={{ width: '100%', display: 'inline' }}>Don't have an account?</p> 
      <Link to={"/signup"}>
        <Button  color="secondary" style={{ display: 'inline' }}>
            Create an Account
          </Button>
      </Link>
      </div>
      <Dialog open={openChildDialog} onClose={() => setOpenChildDialog(false)}>
        <DialogTitle>Enter Child's Information</DialogTitle>
        <DialogContent>
          <DialogContentText>
            To access your child's information, please enter their full name and birthdate.
            {error && (
            <Typography color="error" variant="body2" style={{ marginBottom: 8 }}>
              {error}
            </Typography>
          )}
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="childName"
            label="Child's Full Name"
            type="text"
            fullWidth
            variant="standard"
            value={childName}
            onChange={(e) => setChildName(e.target.value)}
          />
          <TextField
            autoFocus
            margin="dense"
            id="childBirthdate"
            label="Child's Birthdate"
            type="date"
            fullWidth
            variant="standard"
            value={childBirthdate}
            onChange={(e) => setChildBirthdate(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenChildDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleParentLogin} color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      </Container>

      

  );
};

const validationSchema = yup.object().shape({
  email: yup.string().email("invalid email").required("required"),
  password: yup
  .string()
  .required("required")
});

export default Login;