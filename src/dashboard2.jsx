import { Box, Button, Typography, useTheme } from "@mui/material";
import { tokens } from "../theme";
import { Chart } from "chart.js/auto"
import { Bar, Line } from "react-chartjs-2";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import Header from "../components/Header";
import StatBox from "../components/StatBox";
import { db } from '../firebase.config';
import { collection, getDocs, getCountFromServer, query, where } from 'firebase/firestore';
import { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const pdfRef = useRef();

  const [patientCount, setPatientCount]= useState(null);
  const [sTreatmentCount, setsTreatmentCount] = useState(null); //not started on Treatment
  const [oTreatmentCount, setoTreatmentCount]= useState(null); //ongoing Treatment
  const [eTreatmentCount, seteTreatmentCount]= useState(null); //end Treatment
  const [treatment, setTreatment]= useState([]);
  const [doses, setDoses] = useState({});;
  const [patients, setPatients]= useState([]);
  const [outcomes, setOutcomes] = useState({});

  useEffect(() => {
    // Load data from Firebase when the component mounts
    loadData();
  }, []);

  const loadData = async () => {
// ROW 1
    //# of patients
    const patientRefCases = await getCountFromServer(query(collection(db, "mockdata")));
    const patientCounterCases = patientRefCases.data().count;
    setPatientCount(patientCounterCases);
    //# of not started treatment
    const enrolledRef = await getDocs(query(collection(db, "mockdata"), where("caseStatus", "==", "Enrolled")));
    const enrolledCounter = enrolledRef.size
    const diagnosedRef = await getDocs(query(collection(db, "mockdata"), where("caseStatus", "==", "Diagnosed")));
    const diagnosedCounter = diagnosedRef.size
    const calculateDifference = setsTreatmentCount(Math.abs(enrolledCounter + diagnosedCounter));
    
    //# of ongoing treatment
    const oTreatmentRef = await getDocs(query(collection(db, "mockdata"), where("caseStatus", "==", "Ongoing Treatment")));
    const oTreatmentCounter = oTreatmentRef.size
    setoTreatmentCount(oTreatmentCounter);
    //# of end treatment
    const eTreatmentRef = await getDocs(query(collection(db, "mockdata"), where("caseStatus", "==", "Outcome")));
    const eTreatmentCounter = eTreatmentRef.size
    seteTreatmentCount(eTreatmentCounter);
// ROW 2
    //outcomes group by month
    const groupByMonth = (outcomes) => {
      const grouped = {};
      outcomes.forEach(({ outcome, dateCaseEnded }) => {
        const month = dateCaseEnded.toLocaleString('default', { month: 'long' });
        if (!grouped[month]) {
          grouped[month] = [];
        }
        grouped[month].push(outcome);
      });
      return grouped;
    };
    
    // Fetch data from Firestore and group by months
    const fetchDataAndGroupByMonth = async () => {
      const querySnapshot = await getDocs(collection(db, 'mockdata'));
      const outcomes = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const dateCaseEnded = data.dateCaseEnded.toDate(); // Convert Firestore Timestamp to Date
        outcomes.push({ outcome: data.outcome, dateCaseEnded });
      });
      return groupByMonth(outcomes);
    };

    const outcomeRef = await getDocs(collection(db, "mockdata"));
    const outcomeCounts = {};

outcomeRef.docs.forEach(doc => {
  const data = doc.data();
  if (data.outcome) {
    // Assuming 'outcome' is a string
    const outcome = data.outcome;
    if (outcomeCounts[outcome]) {
      outcomeCounts[outcome] += 1;
    } else {
      outcomeCounts[outcome] = 1;
    }
  }
});
setOutcomes(outcomeCounts);
    
    
    //inventory
    const inventoryRef = await getDocs(collection(db, "treatmentPlan"));
    const uniqueDrugs = new Set();
    let tempDoses = {};

    inventoryRef.docs.forEach(doc => {
      const data = doc.data();
      if (data.dosageT) {
        for (const [drug, dose] of Object.entries(data.dosageT)) {
          if (!uniqueDrugs.has(drug)) {
            uniqueDrugs.add(drug);
            tempDoses[drug] = dose;
          } else {
            tempDoses[drug] += dose;
          }
        }
      }
    });
    setDoses(tempDoses);
  
    
  }
  
  

  const downloadPDF = () => {
    const input = pdfRef.current;
    html2canvas(input).then((canvas) =>{
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4', true);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 30;
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save('invoice.pdf');
    });
  }

  return (
    <Box m="20px">
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="DASHBOARD" subtitle="Welcome to your dashboard" />

        <Box>
          <Button
            onClick={downloadPDF}
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
        ref={pdfRef}
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
          <StatBox title={patientCount} subtitle="Number of Patients" />
        </Box>
        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox title={sTreatmentCount} subtitle="Diagnosed" />
        </Box>
        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox title={oTreatmentCount} subtitle="Ongoing Treatment" />
        </Box>
        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox title={eTreatmentCount} subtitle="Ended Treatment" />
        </Box>
{/* Charts */}
        {/* ROW 2 */}
        <Box
          gridColumn="span 8"
          gridRow="span 2"
          p="16px"
          backgroundColor={colors.primary[400]}
        >
          <Typography
            variant="h3"
            fontWeight="600"
            textAlign="center"
            sx={{ padding: "0px 0px 0px 0px" }}
          >
            Outcomes
          </Typography>
          <Box
          height="90%"
          width="90%"
          marginTop="10px"
          display="flex"
          justifyContent="center"
          alignItems="center"
          >
            <Bar
            data={{
              labels: Object.keys(outcomes),
              datasets: [
                {
                  label: 'Total Count',
                  data: Object.values(outcomes),
                  backgroundColor: [
                    // Add more colors as needed
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                  ],
                  borderColor: [
                    // Add more border colors as needed
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                  ],
                  borderWidth: 1
                }
              ]
            }}
            options={{
              indexAxis: 'x', // Use 'x' if you prefer horizontal bars
              scales: {
                y: {
                  beginAtZero: true
                }
              },
              plugins: {
                legend: {
                  display: true
                }
              }
            }}
          />


          </Box>
        </Box>

        <Box
          gridColumn="span 8"
          gridRow="span 2"
          p="16px"
          backgroundColor={colors.primary[400]}
        >
          <Typography
            variant="h3"
            fontWeight="600"
            textAlign="center"
            sx={{ padding: "0px 0px 0px 0px" }}
          >
            Clinical Inventory
          </Typography>
          <Box
            height="230px"
            marginTop="16px"
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <Bar
              data={{
                labels: Object.entries(doses).map(([drug, dose], index) => (drug)),
                datasets: [
                  {
                    label: "Quantity",
                    data: Object.entries(doses).map(([drug, dose], index) => (dose)),
                    backgroundColor: [
                      "rgb(208, 162, 247)",
                      "aqua",
                      "pink",
                      "lightgreen",
                      "lightblue",
                      "gold",
                    ],
                    borderColor: ["white"],
                    borderWidth: 2,
                  },
                ],
              }}
              options={{
                maintainAspectRatio: false,
              }}
            />
          </Box>
        </Box>

        

     </Box>
    </Box>
  );
};

export default Dashboard;
