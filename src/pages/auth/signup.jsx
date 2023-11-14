import React, { useState } from 'react'
import { auth } from '../../firebase.config';
import { createUserWithEmailAndPassword } from 'firebase/auth';
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
  const [role, setRole] = useState('');
  // Sample data for dropdowns
  const roles = ["Doctor", "Lab Aide", "MedTech", "Nurse", "Parent"];

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log(userCredential);
      const user = userCredential.user;
      localStorage.setItem('token', user.accessToken);
      localStorage.setItem('user', JSON.stringify(user));
      navigate("/");
      alert('User created successfully!');
    } catch (error) {
      console.error(error);
    }
  }

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
              {/* role */}
                <FormControl fullWidth required margin="dense">
                    <InputLabel id="role-label">User Role</InputLabel>
                    <Select
                    variant="filled"
                    required
                    label="role-label"
                    name="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    >
                    <MenuItem value="" ></MenuItem>
                    {roles.map((option) => (
                        <MenuItem key={option} value={option}>{option}</MenuItem>
                    ))}
                    </Select>
                </FormControl>
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