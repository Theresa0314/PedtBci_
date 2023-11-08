import * as yup from "yup";
import * as React from 'react';

import { Box, Container, Button, TextField, MenuItem, InputLabel, Select, Grid, InputAdornment, IconButton } from "@mui/material";
import { Formik } from "formik";
//import Visibility from '@mui/icons-material/Visibility';
//import VisibilityOff from '@mui/icons-material/VisibilityOff';
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../components/Header";

const Form = () => {
  const isNonMobile = useMediaQuery("(min-width:600px)");

  const handleFormSubmit = (values) => {
    console.log(values);
  };

  //password
  const [showPassword, setShowPassword] = React.useState(false);
  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

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
        onSubmit={handleFormSubmit}
        initialValues={initialValues}
        validationSchema={checkoutSchema}
      >
        {({
          values,
          errors,
          touched,
          handleBlur,
          handleChange,
          handleSubmit,
        }) => (
          <form onSubmit={handleSubmit}>
            <Box
              display="grid"
              gap="30px"
              gridTemplateColumns="repeat(4, minmax(0, 1fr))"
              sx={{
                "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
              }}
            >
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="First Name"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.firstName}
                name="firstName"
                error={!!touched.firstName && !!errors.firstName}
                helperText={touched.firstName && errors.firstName}
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Last Name"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.lastName}
                name="lastName"
                error={!!touched.lastName && !!errors.lastName}
                helperText={touched.lastName && errors.lastName}
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Email"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.email}
                name="email"
                error={!!touched.email && !!errors.email}
                helperText={touched.email && errors.email}
                sx={{ gridColumn: "span 4" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type={showPassword ? 'text' : 'password'}
                label="Password"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.password}
                name="password"
                error={!!touched.password && !!errors.password}
                helperText={touched.password && errors.password}
                sx={{ gridColumn: "span 4" }}/>

              <TextField
                fullWidth
                variant="filled"
                type={showPassword ? 'text' : 'password'}
                label="Confirm Password"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.cpassword}
                name="cpassword"
                error={!!touched.cpassword && !!errors.cpassword}
                helperText={touched.cpassword && errors.cpassword}
                sx={{ gridColumn: "span 4" }}/>

              {/* <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Contact Number"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.contact}
                name="contact"
                error={!!touched.contact && !!errors.contact}
                helperText={touched.contact && errors.contact}
                sx={{ gridColumn: "span 4" }}
              />
               <InputLabel id="user-type-label">Select User Type</InputLabel>
              <Select
                fullWidth
                variant="filled"
                labelId="user-type-label"
                label="User Type"
                value={values.user_type}
                name="user_type"
                onBlur={handleBlur}
                onChange={handleChange}
                error={!!touched.user_type && !!errors.user_type}
                helperText={touched.user_type && errors.user_type}
                sx={{ gridColumn: "span 4" }}
              >
                <MenuItem  value="medtech" label="Medical Technologist">
                  Medical Technologist{""}
                </MenuItem >
                <MenuItem  value="labaide" label="Lab Aide">
                Lab Aide
                </MenuItem >
                <MenuItem  value="nurse" label="Nurse">
                  Nurse
                </MenuItem >
                <MenuItem  value="doctor" label="Doctors">
                  Doctor
                </MenuItem >
                <MenuItem  value="parent" label="Parents">
                  Parents
                </MenuItem >
              </Select> */}

            </Box>
            <Box display="flex" justifyContent="end" mt="20px">
              <Button type="submit" color="secondary" variant="contained">
                SIGN UP
              </Button>
            </Box>
          </form>
        )}
      </Formik>
    </Box>
    </Grid>

  );
};

// const phoneRegExp =
//   /^((\+[1-9]{1,4}[ -]?)|(\([0-9]{2,3}\)[ -]?)|([0-9]{2,4})[ -]?)*?[0-9]{3,4}[ -]?[0-9]{3,4}$/;

const checkoutSchema = yup.object().shape({
  firstName: yup.string().required("required"),
  lastName: yup.string().required("required"),
  email: yup.string().email("invalid email").required("required"),
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
  // contact: yup
  //   .string()
  //   .matches(phoneRegExp, "Phone number is not valid")
  //   .required("required"),
  // user_type: yup.string().required("required"),
});
const initialValues = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  cpassword: ""
  // contact: "",
  // user_type: "",
};

export default Form;