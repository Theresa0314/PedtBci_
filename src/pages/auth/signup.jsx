import React, { useState } from 'react'
import { auth } from '../../firebase.config';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';

//import * as yup from "yup";
import { Box, Button, TextField, Grid } from "@mui/material";
import { Formik } from "formik";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";

const Signup = () => {
  const isNonMobile = useMediaQuery("(min-width:600px)");
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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
  <Grid
    container
    spacing={0}
    direction="column"
    alignItems="center"
    justifyContent="center"
    sx={{ minHeight: '100vh' }}
  >
      <Box m="20px">
      <Header title="SIGN UP" subtitle="Register User" />

      <Formik
        onSubmit={handleSubmit}
        // validationSchema={signupSchema}
        className='signup-form'
      >
          <form onSubmit={handleSubmit}>
            <Box
              display="grid"
              gap="30px"
              gridTemplateColumns="repeat(4, minmax(0, 1fr))"
              sx={{
                "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
              }}
            >

            {/* email */}
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Email"
                name="email"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                sx={{ gridColumn: "span 4" }}
              />

              {/* password */}
              <TextField
                fullWidth
                variant="filled"
                type="password"
                label="Password"
                name="password"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                sx={{ gridColumn: "span 4" }}/>

              {/* <TextField
                fullWidth
                variant="filled"
                type="password"
                label="Confirm Password"
                onBlur={handleBlur}
                onChange={handleChange}
                
                name="cpassword"
                error={!!touched.cpassword && !!errors.cpassword}
                helperText={touched.cpassword && errors.cpassword}
                sx={{ gridColumn: "span 4" }}/> */}
            </Box>
              {/* submit button */}
            <Box display="flex" justifyContent="end" mt="20px">
              <Button type="submit" color="secondary" variant="contained">
                SIGN UP
              </Button>
            </Box>
          </form>
      </Formik>
      <p className="forget">Already have an account? <Link to={"/login"}>{"Login"}</Link></p>
    </Box>
    </Grid>

  );
};

// const signupSchema = yup.object().shape({
//   email: yup.string().email("invalid email").required("required"),
//   password: yup
//   .string()
//   .required("required")
//   .matches(
//     /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/,
//     "Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and One Special Case Character"
//   ),
//   cpassword: yup
//   .string()
//   .required("required")
//   .oneOf([yup.ref("password"), null], "Passwords must match")
// });

export default Signup;