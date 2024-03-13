import React, { useState, useEffect } from "react";
import {
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Button,
  Container,
  useTheme,
  Divider,
  //TextField,
} from "@mui/material";
import { tokens } from "../../theme";
import { db, apiCalendar } from "../../firebase.config";
import {
  doc,
  collection,
  getDoc,
  addDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";

// Sample data for dropdowns
const regimens = [
  "I. 2HRZE/4HR",
  "Ia. 2HRZE/10HR",
  "II. 2HRZES/1HRZE/5HRE",
  "IIa. 2HRZES/1HRZE/9HRE",
];
//const statuses = ["Ongoing", "End"];
//const outcomes = ["Cured/Treatment Completed", "Treatment Failed", "Died", "Lost to Follow up", "Not Evaluated"];

const TPForm = ({ handleCloseForm, handleUpdateTP, caseId, caseNumber }) => {
  // State hooks for form data
  const [regimen, setRegimen] = useState("");
  const [name, setName] = useState("");
  const [weight, setWeight] = useState("");

  // Fetch case name when the component mounts
  useEffect(() => {
    const fetchName = async () => {
      const docRef = doc(db, "cases", caseId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setName(docSnap.data().fullName);
        console.log("No such case!");
      }
    };

    fetchName();
  }, [caseId]);

  // Fetch the weight of the child when the component mounts
  useEffect(() => {
    const q = query(
      collection(db, "patientsinfo"),
      where("caseNumber", "==", caseNumber)
    );

    getDocs(q).then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        setWeight(doc.data().weight);
      });
    });
  }, [caseNumber]);

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const treatmentDurations = {
    "I. 2HRZE/4HR": 6,
    "Ia. 2HRZE/10HR": 12,
    "II. 2HRZES/1HRZE/5HRE": 7,
    "IIa. 2HRZES/1HRZE/9HRE": 11,
  };

  const intensiveDurations = {
    "I. 2HRZE/4HR": 2,
    "Ia. 2HRZE/10HR": 2,
    "II. 2HRZES/1HRZE/5HRE": 2,
    "IIa. 2HRZES/1HRZE/9HRE": 2,
  };

  const continuationDurations = {
    "I. 2HRZE/4HR": 4,
    "Ia. 2HRZE/10HR": 10,
    "II. 2HRZES/1HRZE/5HRE": 5,
    "IIa. 2HRZES/1HRZE/9HRE": 9,
  };

  const treatmentMedications = {
    "I. 2HRZE/4HR": [
      "[H] Isoniazid, ",
      "[R] Rifampicin, ",
      "[Z] Pyrazinamide, ",
      "[E] Ethambutol",
    ],
    "Ia. 2HRZE/10HR": [
      "[H] Isoniazid, ",
      "[R] Rifampicin, ",
      "[Z] Pyrazinamide, ",
      "[E] Ethambutol",
    ],
    "II. 2HRZES/1HRZE/5HRE": [
      "[H] Isoniazid, ",
      "[R] Rifampicin, ",
      "[Z] Pyrazinamide, ",
      "[E] Ethambutol, ",
      "[S] Streptomycin",
    ],
    "IIa. 2HRZES/1HRZE/9HRE": [
      "[H] Isoniazid, ",
      "[R] Rifampicin, ",
      "[Z] Pyrazinamide, ",
      "[E] Ethambutol, ",
      "[S] Streptomycin",
    ],
  };

  //start date of treatment plan
  const startDateTP = new Date().toLocaleDateString();
  const duration = treatmentDurations[regimen]; // duration in months
  const durationI = intensiveDurations[regimen]; //intensive months
  const durationC = continuationDurations[regimen]; //continuation months
  const medication = treatmentMedications[regimen];
  const dosage = calculateDosage(weight);
  //calculate new month number
  const dateObject = new Date(startDateTP);
  const monthNumber = dateObject.getMonth();
  const newMonthNumber = monthNumber + duration;
  //adjust year if new month exceeds Dec
  const newYear = dateObject.getFullYear() + Math.floor(newMonthNumber / 12);
  const newMonth = newMonthNumber % 12;

  //end date
  const endDateTP = new Date(
    newYear,
    newMonth,
    dateObject.getDate()
  ).toLocaleDateString();

  //follow up schedules
  const calculateFollowUpDates = () => {
    const followUpDates = [];
    let currentDate = new Date(startDateTP);
    let endDate = new Date(endDateTP);

    currentDate.setDate(currentDate.getDate() + 14); // Start two weeks after the initial start date

    while (currentDate <= endDate) {
      followUpDates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 14); // Add 2 weeks
    }
    return followUpDates;
  };

  const followUpDates = calculateFollowUpDates();

  //Fixed-dose combinations for each weight band
  function calculateDosage(weight) {
    const fdc = {
      "1-3": { H: 1, R: 1, Z: 1, E: 1 },
      "4-7": { H: 1, R: 1, Z: 1, E: 1 },
      "8-11": { H: 2, R: 2, Z: 2, E: 2 },
      "12-15": { H: 3, R: 3, Z: 3, E: 3 },
      "16-24": { H: 4, R: 4, Z: 4, E: 4 },
      "25-37": { H: 5, R: 5, Z: 5, E: 5 },
      "38-54": { H: 6, R: 6, Z: 6, E: 6 },
      "55-70": { H: 7, R: 7, Z: 7, E: 7 },
      "70-100": { H: 8, R: 8, Z: 8, E: 8 },
    };

    // Find the weight band that matches the weight
    const weightBand = Object.keys(fdc).find((band) => {
      const [min, max] = band.split("-");
      return weight >= min && weight <= max;
    });

    return fdc[weightBand];
  }

  const formatDate = (date) => {
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  };

  //Submit form
  const handleSubmit = async (event) => {
    event.preventDefault();

    const TPData = {
      caseId, // Directly used from props
      caseNumber, // Directly used from props
      name,
      regimen,
      startDateTP,
      endDateTP,
      duration,
      medication,
      followUpDates,
    };

    try {
      const docRef = await addDoc(collection(db, "treatmentPlan"), TPData);
      const newTP = { ...TPData, id: docRef.id };
      handleUpdateTP(newTP); // Call the function to update the treatment plan list
      handleCloseForm(); // Close the form after submission

      //Add followUpDates to Google Calendar
      followUpDates.forEach((date, index) => {
        const event = {
          summary: `Follow Up for ${name}`,
          start: {
            dateTime: date.toISOString(),
            timeZone: "Asia/Manila",
          },
          end: {
            dateTime: date.toISOString(),
            timeZone: "Asia/Manila",
          },
        };
        // API KEY: 1b35ebc5f7671828c3c6e76c04437c4e
        const apikey = "1b35ebc5f7671828c3c6e76c04437c4e";
        const number = '09064525156';
        const message = `Your treatment plan follow-up dates are confirmed! 📅 Kindly check your google calendar:\n${followUpDates
          .map((date) => formatDate(date))
          .join("\n")}`;

        const parameters = {
          apikey,
          number,
          message,
        };

        console.log(JSON.stringify(parameters))

        fetch("https://api.semaphore.co/api/v4/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams(parameters),
        })
          .then((res) => res.text())
          .then((output) => {
            console.log(`Success: ${JSON.stringify(output)}`);
          })
          .catch((err) => {
            console.error(err);
          });

        // Use the apiCalendar to add the event to Google Calendar
        apiCalendar
          .createEvent(event)
          .then((response) => {
            console.log(response);
          })
          .catch((error) => {
            console.error(error);
          });
      });
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  return (
    <Container
      component="main"
      maxWidth="md"
      sx={{
        backgroundColor: colors.blueAccent[800],
        padding: theme.spacing(6),
        borderRadius: theme.shape.borderRadius,
      }}
    >
      <form onSubmit={handleSubmit}>
        {/* Start Section */}
        <Typography
          variant="h5"
          gutterBottom
          sx={{
            color: colors.greenAccent[500],
            fontWeight: "bold",
            fontSize: "1.5rem",
          }}
        >
          Treatment Plan Information of {name}
        </Typography>
        <Grid container spacing={3}>
          {/* TP Regimen */}
          <Grid item xs={4}>
            <FormControl fullWidth required margin="dense">
              <InputLabel id="regimen-label">Treatment Regimen</InputLabel>
              <Select
                required
                labelId="regimen-label"
                id="regimen"
                name="regimen"
                value={regimen}
                onChange={(e) => setRegimen(e.target.value)}
              >
                <MenuItem value=""></MenuItem>
                {regimens.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          {/* Duration */}
          <Grid item xs={4}>
            <Typography
              variant="body1"
              sx={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}
            >
              <strong>Duration:</strong> {duration} <light> months</light>
            </Typography>
            <Typography
              variant="body1"
              sx={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}
            >
              <strong>Intensive Phase:</strong> {durationI}{" "}
              <light> months</light>
            </Typography>
            <Typography
              variant="body1"
              sx={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}
            >
              <strong>Continuation Phase:</strong> {durationC}{" "}
              <light> months</light>
            </Typography>
          </Grid>
          {/* Start date and End date */}
          <Grid item xs={4}>
            <Typography
              variant="body1"
              sx={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}
            >
              <strong>Start Date:</strong> {startDateTP}
            </Typography>
            <Typography
              variant="body1"
              sx={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}
            >
              <strong>End Date:</strong> {endDateTP}
            </Typography>
          </Grid>
          {/* Medications */}
          <Divider sx={{ bgcolor: colors.grey[500], my: 2 }} />
          {medication ? (
            <Grid item xs={4}>
              <Typography
                variant="body1"
                sx={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}
              >
                <strong>Medications: </strong>
              </Typography>
              <Typography
                variant="body1"
                sx={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}
              >
                {medication}
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  fontSize: "1rem",
                  marginBottom: "0.5rem",
                  color: colors.greenAccent[500],
                }}
              >
                <light>The weight of the child is {weight} kg. </light>
              </Typography>
            </Grid>
          ) : (
            <Grid item xs={4}>
              <Typography
                variant="body1"
                sx={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}
              >
                <strong>Medications: </strong>
              </Typography>
              <Typography
                variant="body1"
                sx={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}
              >
                [H] Isoniazid, [R] Rifampicin, [Z] Pyrazinamide, [E] Ethambutol
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  fontSize: "1rem",
                  marginBottom: "0.5rem",
                  color: colors.greenAccent[500],
                }}
              >
                <light>The weight of the child is {weight} kg. </light>
              </Typography>
            </Grid>
          )}

          {/* Dosage/Tablets */}
          {weight ? (
            <Grid item xs={3}>
              <Typography
                variant="body1"
                sx={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}
              >
                <strong>The number of tablets for each drug is:</strong>
              </Typography>
              <ul>
                {Object.entries(dosage).map(([drug, dose]) => (
                  <li key={drug}>
                    {drug}: {dose}
                  </li>
                ))}
              </ul>
            </Grid>
          ) : (
            <p></p>
          )}
          {/* Follow up dates */}
          <Grid item xs={3}>
            <Typography
              variant="body1"
              sx={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}
            >
              <strong>Follow-Up Dates: </strong>
            </Typography>
            <ul>
              {followUpDates.map((date, index) => (
                <li key={index}>{date.toLocaleDateString()}</li>
              ))}
            </ul>
          </Grid>
          <Divider sx={{ bgcolor: colors.grey[500], my: 2 }} />
          {/* Submit and Cancel Buttons */}
          <Grid container spacing={2} justifyContent="center">
            <Grid item>
              <Button
                type="submit"
                variant="contained"
                sx={{
                  backgroundColor: colors.greenAccent[600],
                  color: colors.grey[100],
                  mr: 1,
                }}
              >
                Save
              </Button>
            </Grid>
            <Grid item>
              <Button
                onClick={handleCloseForm}
                variant="outlined"
                sx={{ color: colors.grey[100], borderColor: colors.grey[700] }}
              >
                Cancel
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </form>
    </Container>
  );
};

export default TPForm;
