import React, { useState } from 'react'
import { auth } from '../../firebase.config';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';

import * as yup from "yup";
import {Button, TextField, Grid,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  Container, useTheme } from "@mui/material";
import { collection, query, where, getDocs, getDoc, doc} from "firebase/firestore";
import { db } from '../../firebase.config';
import { Formik, ErrorMessage } from "formik";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { usePatientInfo } from '../../PatientInfoContext';

const Login = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [openCaseDialog, setOpenCaseDialog] = useState(false);
  const [caseNumber, setCaseNumber] = useState('');

  const { setPatientInfoId } = usePatientInfo();
  const navigate = useNavigate();

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
          setOpenCaseDialog(true);
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
  const handleCaseSubmit = async () => {
    const caseQuery = query(collection(db, "patientsinfo"), where("caseNumber", "==", caseNumber));
    const querySnapshot = await getDocs(caseQuery);
    if (!querySnapshot.empty) {
      const patientDoc = querySnapshot.docs[0];
      setPatientInfoId(patientDoc.id); // Update the context with the patient info ID
      navigate(`/patientinfo/${patientDoc.id}`);
      setOpenCaseDialog(false);
    } else {
      console.error("No matching case number found!");
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
              {/* submit button */}
            <Grid container justifyContent="right" sx={{ mt: 4 }}>
              <Button type="submit" color="secondary" variant="contained">
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
      <Dialog open={openCaseDialog} onClose={() => setOpenCaseDialog(false)}>
      <DialogTitle>Enter Case Number</DialogTitle>
      <DialogContent>
        <DialogContentText>
          To view patient information, please enter your case number.
        </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          id="caseNumber"
          label="Case Number"
          type="text"
          fullWidth
          variant="standard"
          value={caseNumber}
          onChange={(e) => setCaseNumber(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpenCaseDialog(false)} color="primary">
          Cancel
        </Button>
        <Button onClick={handleCaseSubmit} color="primary">
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