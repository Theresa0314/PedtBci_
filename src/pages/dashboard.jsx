import { Box, Button, Typography, useTheme } from "@mui/material";
import { tokens } from "../theme";
import { Chart } from "chart.js/auto"
import { Bar, Doughnut } from "react-chartjs-2";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import Header from "../components/Header";
import StatBox from "../components/StatBox";
import { db } from '../firebase.config';
import { collection, getDocs, getCountFromServer, query, where } from 'firebase/firestore';
import { useState, useEffect } from 'react';

const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [patientCount, setPatientCount]= useState(null);
  const [sTreatmentCount, setsTreatmentCount]= useState(null); //start Treatment
  const [oTreatmentCount, setoTreatmentCount]= useState(null); //ongoing Treatment
  const [eTreatmentCount, seteTreatmentCount]= useState(null); //end Treatment
  const [treatment, setTreatment]= useState([]);
  const [inventory, setInventory]= useState([]);
  const [patients, setPatients]= useState([]);

  useEffect(() => {
    // Load data from Firebase when the component mounts
    loadData();
  }, []);

  const loadData = async () => {
// ROW 1
    //# of patients
    const patientRef = await getCountFromServer(query(collection(db, "treatmentPlan")));
    const patientCounter = patientRef.data().count;
    setPatientCount(patientCounter);
    //# of started treatment
    const sTreatmentRef = await getDocs(query(collection(db, "treatmentPlan"), where("status", "==", "Start")));
    const sTreatmentCounter = sTreatmentRef.size
    setsTreatmentCount(sTreatmentCounter);
    //# of ongoing treatment
    const oTreatmentRef = await getDocs(query(collection(db, "treatmentPlan"), where("status", "==", "Ongoing")));
    const oTreatmentCounter = oTreatmentRef.size
    setoTreatmentCount(oTreatmentCounter);
    //# of end treatment
    const eTreatmentRef = await getDocs(query(collection(db, "treatmentPlan"), where("status", "==", "End")));
    const eTreatmentCounter = eTreatmentRef.size
    seteTreatmentCount(eTreatmentCounter);
// ROW 2
    //treatment progress
    const treatmentRef = await getDocs(collection(db, "treatmentPlan"));
    let treatmentData = treatmentRef.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    setPatients(treatmentData);
    //inventory
    const inventoryRef = await getDocs(collection(db, "inventory"));
    let inventoryData = inventoryRef.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    setInventory(inventoryData);
    //referred patients
    const patientsRef = await getDocs(collection(db, "referralform"));
    let patientsData = patientsRef.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    setPatients(patientsData);
  }
  
  return (
    <Box m="20px">
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="DASHBOARD" subtitle="Welcome to your dashboard" />

        <Box>
          <Button
            sx={{
              backgroundColor: colors.blueAccent[700],
              color: colors.grey[100],
              fontSize: "14px",
              fontWeight: "bold",
              padding: "10px 20px",
            }}
          >
            <DownloadOutlinedIcon sx={{ mr: "10px" }} />
            Download Reports
          </Button>
        </Box>
      </Box>

      {/* GRID & CHARTS */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gridAutoRows="140px"
        gap="20px"
      >
        {/* ROW 1 */}
        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title= {patientCount}
            subtitle="Number of Patients"
          />
        </Box>
        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={sTreatmentCount}
            subtitle="Started Treatment"
          />
        </Box>
        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={oTreatmentCount}
            subtitle="Ongoing Treatment"
          />
        </Box>
        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={eTreatmentCount}
            subtitle="Ended Treatment"
          />
        </Box>

        {/* ROW 2 */}
        <Box
          gridColumn="span 4"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
        >
          <Box
            mt="25px"
            display="flex "
          >
          <Box>
          <Typography
            variant="h3"
            fontWeight="600"
            sx={{ padding: "0px 0px 0px 30px" }}
            marginBottom="20px"
          >
          Treatment Progress of Patients
          </Typography>
          <Box  sx={{ padding: "0px 30px" }} color={colors.greenAccent[500]}>
          <h3>Start: {sTreatmentCount}</h3>
          <h3>Ongoing: {oTreatmentCount}</h3>
          <h3>End: {eTreatmentCount}</h3>
          </Box>
          </Box>
          <Box height="250px" m="-20px 0 0 0" marginLeft="30px">
          <Doughnut
              data={{
                labels: ['Start', 'Ongoing', 'End'],
                datasets: [
                  {
                    label: "Count",
                    data: [sTreatmentCount,oTreatmentCount,eTreatmentCount],
                    backgroundColor: [
                      'rgb(255, 99, 132)',
                      'rgb(54, 162, 235)',
                      'rgb(255, 205, 86)'
                    ],
                    hoverOffset: 4
                  }]
              }}
           />
          </Box>
          </Box>
        </Box>

        <Box
          gridColumn="span 4"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
        >
          <Box
            mt="25px"
            p="0 30px"
            display="flex "
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography
            variant="h3"
            fontWeight="600"
            marginBottom="25px"
              >
                Clinical Inventory
              </Typography>
            </Box>
          </Box>
          <Box height="250px" m="-20px 0 0 0" marginLeft="30px">
           <Bar
              data={{
                labels: inventory.map((doc) => doc.name),
                datasets: [
                  {
                    label: "Quantity",
                    data: inventory.map((doc) => doc.quantity),
                    backgroundColor: ['rgb(208, 162, 247)', 'aqua', 'pink', 'lightgreen', 'lightblue', 'gold'],
                    borderColor: ['white'],
                    borderWidth: 2,
                    
                  }]
              }}
           />
          </Box>
        </Box>
        <Box
          gridColumn="span 4"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          overflow="auto"
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            borderBottom={`4px solid ${colors.primary[500]}`}
            colors={colors.grey[100]}
            p="15px"
          >
            <Typography color={colors.grey[100]} variant="h5" fontWeight="600">
              Recently Referred Patients
            </Typography>
          </Box>
          {patients.map((doc, i) => (
            <Box
              key={`${doc.id}-${i}`}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              borderBottom={`4px solid ${colors.primary[500]}`}
              p="15px"
            >
              <Box>
                <Typography
                  color={colors.greenAccent[500]}
                  variant="h5"
                  fontWeight="600"
                >
                  {doc.caseNumber}
                </Typography>
                <Typography color={colors.grey[100]}>
                  {doc.dotsStaffName}
                </Typography>
              </Box>
              {/* date referred */}
              <Box 
              color={colors.grey[100]}>
                {doc.receivingFacilityDateReceived}
                </Box>
              <Box
                backgroundColor={colors.greenAccent[500]}
                p="5px 10px"
                borderRadius="4px"
              >
                {doc.caseStatus}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
