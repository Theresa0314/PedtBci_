import React, { useState } from 'react'
import { auth, db } from '../../firebase.config';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';

import * as yup from "yup";
import {Button, TextField, Grid, Container, FormControl, InputLabel, Select, MenuItem, useTheme } from "@mui/material";
import { Formik, ErrorMessage  } from "formik";
import { tokens } from "../../theme";
import Header from "../../components/Header";

const Signup = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cpassword, setcPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const navigate = useNavigate();


// Function to add user information to Firestore
const addUserToFirestore = async (userId, email, fullName, role = 'Patient') => {
  try {
    const currentDate = new Date(); 
    await setDoc(doc(db, 'users', userId), {
      email,
      fullName,
      role,
      dateAdded: currentDate, 
    });
  } catch (error) {
    console.error('Error adding user to Firestore: ', error);
    throw error;
  }
};

const handleSubmit = async (e) => {
  e.preventDefault();
  if (password !== cpassword) {
    alert('Passwords do not match');
    return;
  }
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    // Add user to Firestore with email, fullName, and the default 'Patient' role
    await addUserToFirestore(user.uid, email, fullName); 
    localStorage.setItem('token', user.accessToken);
    localStorage.setItem('user', JSON.stringify(user));
    navigate("/");
    alert('User created successfully with Patient role!');
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
};


  return (
<Container 
  component="main" 
  maxWidth="sm" sx={{
  backgroundColor: colors.blueAccent[800], 
  padding: theme.spacing(6), 
  borderRadius: theme.shape.borderRadius
}}><Header title="SIGN UP" subtitle="Register User" />

      <Formik
        onSubmit={handleSubmit}
        validationSchema={validationSchema}
        className='signup-form'
      >
          <form onSubmit={handleSubmit}>
          <Grid container spacing={5} direction="column" >
            <Grid item xs={6}>
              {/* name */}
              <TextField
              required
              fullWidth
              id="fullName"
              label="Full Name"
              name="fullName"
              variant="filled"
              margin="dense"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              />
            </Grid>

            <Grid item xs={6}>
            {/* email */}
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Email"
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
                label="Password"
                name="password"
                helperText={<ErrorMessage name="password" />}
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                sx={{ gridColumn: "span 4" }}/>
              </Grid>

              <Grid item xs={6}>
              <TextField
                fullWidth
                variant="filled"
                type="password"
                label="Confirm Password"
                onChange={(e) => setcPassword(e.target.value)}
                id="cpassword"
                name="cpassword"
                helperText={<ErrorMessage name="cpassword" />}
                sx={{ gridColumn: "span 4" }}/>
              </Grid>
            </Grid>

              {/* submit button */}
              <Grid container justifyContent="right" sx={{ mt: 4 }}>
              <Button type="submit" color="secondary" variant="contained">
                SIGN UP
              </Button>
            </Grid>
          </form>
      </Formik>
      <div style={{ width: '100%', marginTop: '5vh' }}>
      <p className="forget" style={{ width: '100%', display: 'inline' }}>Already have an account?</p> 
      <Link to={"/login"}>
        <Button  color="secondary" style={{ display: 'inline' }}>
            Login
          </Button>
      </Link>
      </div>
      </Container>
  );
};

const validationSchema = yup.object().shape({
  email: yup.string().email("Please enter a valid email").required("required"),
  password: yup
  .string()
  .required("required")
  .matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/,
    "Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and One Special Case Character"
  ),
  cpassword: yup
  .string()
  .required("required")
  .oneOf([yup.ref("password"), null], "Passwords must match")
});

export default Signup;