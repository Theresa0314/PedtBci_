import React, { useState } from "react";
import { auth } from "../../firebase.config";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";

import * as yup from "yup";
import { Button, TextField, Grid, Container, useTheme, Typography } from "@mui/material";
import { Formik, ErrorMessage } from "formik";
import { tokens } from "../../theme";
import Header from "../../components/Header";

const Login = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log(userCredential);
      const user = userCredential.user;
      localStorage.setItem("token", user.accessToken);
      localStorage.setItem("user", JSON.stringify(user));
      navigate("/");
    } catch (error) {
      console.error(error);
      setLoginError("Invalid email or password. Please try again.");
    }
  };

  return (
    <Container
      component="main"
      maxWidth="sm"
      sx={{
        backgroundColor: colors.blueAccent[800],
        padding: theme.spacing(6),
        borderRadius: theme.shape.borderRadius,
      }}
    >
      <Header title="LOG IN" subtitle="Login User" />

      <Formik
        onSubmit={handleSubmit}
        validationSchema={validationSchema}
        className="login-form"
      >
        <form onSubmit={handleSubmit}>
          {loginError ? (
            <div>
              <Typography color="error">{loginError}</Typography>
            </div>
          ) : (
            <></>
          )}

          <Grid container spacing={5} direction="column">
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
                sx={{ gridColumn: "span 4" }}
              />
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
      <div style={{ width: "100%", marginTop: "5vh" }}>
        <p className="forget" style={{ width: "100%", display: "inline" }}>
          Don't have an account?
        </p>
        <Link to={"/signup"}>
          <Button color="secondary" style={{ display: "inline" }}>
            Create an Account
          </Button>
        </Link>
      </div>
    </Container>
  );
};

const validationSchema = yup.object().shape({
  email: yup.string().email("invalid email").required("required"),
  password: yup.string().required("required"),
});

export default Login;
