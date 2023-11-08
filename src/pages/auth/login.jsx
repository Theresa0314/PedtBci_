import React, { useState } from 'react'
import { auth } from '../../firebase.config';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';

//import * as yup from "yup";
import { Box, Button, TextField, Grid } from "@mui/material";
import { Formik } from "formik";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";

const Login = () => {
  const isNonMobile = useMediaQuery("(min-width:600px)");

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log(userCredential);
      const user = userCredential.user;
      localStorage.setItem('token', user.accessToken);
      localStorage.setItem('user', JSON.stringify(user));
      navigate("/");
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
      <Header title="LOG IN" subtitle="Login User" />

      <Formik
        onSubmit={handleSubmit}
        // validationSchema={loginSchema}
        className='login-form'
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
            </Box>
              {/* submit button */}
            <Box display="flex" justifyContent="end" mt="20px">
              <Button type="submit" color="secondary" variant="contained">
                LOGIN
              </Button>
            </Box>
          </form>
      </Formik>
      <p>Don't have an account?   <Link to={"/signup"}>{"Create Account"}</Link></p>
    </Box>
    </Grid>

  );
};

// const loginSchema = yup.object().shape({
//   email: yup.string().email("invalid email").required("required"),
//   password: yup
//   .string()
//   .required("required")
// });

export default Login;