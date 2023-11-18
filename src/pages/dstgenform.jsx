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
import { db, storage } from "../firebase.config";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Sample data for dropdowns
const location = [
  "Lung Center of the Philippines",
  "Philippine General Hospital",
  "St. Lukes Medical Center - Global City",
];
const result = ["Resistant", "Susceptible", "Indeterminate"];

const DSTGenForm = ({ handleUpdateDST, caseNumber }) => {
  // State hooks for xray information
  const [dstCaseNumber, setDSTCaseNumber] = useState("");
  const [testDate, setTestDate] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [testLocation, setTestLocation] = useState("");
  const [testResult, setTestResult] = useState("");
  const [isoniazid, setIsoniazid] = useState("");
  const [ethionamide, setEthionamide] = useState("");
  const [fluoroquinolones, setFluoroquinolones] = useState("");
  const [amikacin, setAmikacin] = useState("");
  const [file, setFile] = useState(null);
  const [downloadURL, setDownloadURL] = useState("");
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();

  const handleCancel = () => {
    navigate(0);
  };

  // Set the caseNumber in the component's state
  useEffect(() => {
    setDSTCaseNumber(caseNumber);
    console.log("caseNumber: " + caseNumber);
  }, [caseNumber]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      // Upload file
      if (file) {
        const storageRef = ref(storage, `dst-files/${file.name}`);
        await uploadBytes(storageRef, file);

        // Get the download URL of the uploaded file
        const url = await getDownloadURL(storageRef);

        // Set the download URL in the state
        setDownloadURL(url);
        console.log("File uploaded. Download URL:", url);
      }

      // // Generate a unique reference number
      // const referenceNumber =
      //   "XR-" +
      //   Date.now().toString(36) +
      //   Math.random().toString(36).substr(2, 5).toUpperCase();

      const dstData = {
        caseNumber,
        referenceNumber,
        testDate,
        testLocation,
        isoniazid,
        ethionamide,
        fluoroquinolones,
        amikacin,
        fileName: file.name,
        fileURL: downloadURL,
      };

      // Add dst data to Firestore
      const docRef = await addDoc(collection(db, "dst"), dstData);
      console.log("Document written with ID: ", docRef.id);

      // Update xrays if handleUpdateXrays is provided
      if (handleUpdateDST) {
        const newDST = { ...dstData, id: docRef.id };
        handleUpdateDST(newDST);
      }

      // Navigate back to the patient_info page
      navigate(0);
    } catch (error) {
      console.error("Error handling submit: ", error);
    }
  };

  const handleFileChange = (e) => {
    // Handle file upload logic here
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  return (
    <Container
      component="main"
      maxWidth="md"
      sx={{
        backgroundColor: colors.blueAccent[800],
        padding: theme.spacing(5),
        borderRadius: theme.shape.borderRadius,
      }}
    >
      <Typography
        variant="h2"
        gutterBottom
        sx={{ color: colors.white, fontWeight: "bold" }}
      >
        Add DST Information
      </Typography>

      <form onSubmit={handleSubmit}>
        {/* Personal Information Section */}
        <Grid container spacing={5}>
          <Grid item xs={12}>
            <FormControl fullWidth margin="dense">
              <InputLabel id="testLocation">Issued By:</InputLabel>
              <Select
                required
                labelId="testLocation"
                id="testLocation"
                name="testLocation"
                label="Test Location"
                value={testLocation}
                onChange={(e) => setTestLocation(e.target.value)}
              >
                {location.map((item) => (
                  <MenuItem key={item} value={item}>
                    {item}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <TextField
              required
              fullWidth
              id="testDate"
              label="Issued On:"
              name="testDate"
              type="date"
              InputLabelProps={{ shrink: true }}
              variant="outlined"
              margin="dense"
              value={testDate}
              onChange={(e) => setTestDate(e.target.value)}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              required
              fullWidth
              id="referenceNumber"
              label="Reference Number"
              name="referenceNumber"
              variant="outlined"
              margin="dense"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
            />
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth margin="dense">
              <InputLabel id="testResult">Isoniazid Test Result</InputLabel>
              <Select
                required
                labelId="isoniazid"
                id="isoniazid"
                name="isoniazid"
                label="Isoniazid Result"
                value={isoniazid}
                onChange={(e) => setIsoniazid(e.target.value)}
              >
                {result.map((item) => (
                  <MenuItem key={item} value={item}>
                    {item}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth margin="dense">
              <InputLabel id="testResult">Ethionamide Test Result</InputLabel>
              <Select
                required
                labelId="ethionamide"
                id="ethionamide"
                name="ethionamide"
                label="Ethionamide Result"
                value={ethionamide}
                onChange={(e) => setEthionamide(e.target.value)}
              >
                {result.map((item) => (
                  <MenuItem key={item} value={item}>
                    {item}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth margin="dense">
              <InputLabel id="testResult">
                Fluoroquinolones Test Result
              </InputLabel>
              <Select
                required
                labelId="fluoroquinolones"
                id="fluoroquinolones"
                name="fluoroquinolones"
                label="Fluoroquinolones Result"
                value={fluoroquinolones}
                onChange={(e) => setFluoroquinolones(e.target.value)}
              >
                {result.map((item) => (
                  <MenuItem key={item} value={item}>
                    {item}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth margin="dense">
              <InputLabel id="testResult">Amikacin Test Result</InputLabel>
              <Select
                required
                labelId="amikacin"
                id="amikacin"
                name="amikacin"
                label="Amikacin Result"
                value={amikacin}
                onChange={(e) => setAmikacin(e.target.value)}
              >
                {result.map((item) => (
                  <MenuItem key={item} value={item}>
                    {item}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <InputLabel htmlFor="validity" sx={{ color: colors.white }}>
              Upload Xray File Attachment
            </InputLabel>
            <Input
              required
              fullWidth
              id="fileName"
              type="file"
              inputProps={{ accept: ".jpg, .jpeg, .png" }} // Specify accepted file types
              onChange={handleFileChange}
              sx={{ display: "none" }} // Hide the default input style
            />
            <label htmlFor="fileName">
              <Button
                style={{ color: "white", width: "100%" }}
                sx={{
                  mt: 1,
                  borderColor: "rgba(255, 255, 255, 0.3)",
                  height: "50px",
                  "&:hover": {
                    borderColor: "white",
                  },
                }}
                component="span"
                variant="outlined"
              >
                Upload File
              </Button>
            </label>
          </Grid>
        </Grid>

        <Grid container justifyContent="center" sx={{ mt: 4 }}>
          <Button
            type="submit"
            variant="contained"
            sx={{
              backgroundColor: colors.greenAccent[600],
              color: colors.grey[100],
              mr: 1,
            }}
          >
            Save Information
          </Button>
          <Button
            variant="outlined"
            onClick={handleCancel}
            sx={{ color: colors.grey[100], borderColor: colors.grey[700] }}
          >
            Back
          </Button>
        </Grid>
      </form>
    </Container>
  );
};

export default DSTGenForm;
