import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Button,
  Container,
  useTheme,
  Input,
} from "@mui/material";
import { tokens } from "../theme";
import { db , storage} from "../firebase.config";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Sample data for dropdowns
const location = [
  "Lung Center of the Philippines",
  "Philippine General Hospital",
  "St. Lukes Medical Center - Global City",
];
const result = ["With signs of TB", "No signs", "Undetermined"];

const EditXrayGenForm = () => {
    return ( <div></div> );
}
 
export default EditXrayGenForm;