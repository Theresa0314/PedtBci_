import { Box, Button, Typography, useTheme } from "@mui/material";
import { tokens } from "../theme";
import { Chart } from "chart.js/auto"
import { Bar, Doughnut } from "react-chartjs-2";
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

  const [mtbrif, setMTBRIF]= useState([]);
  const [xray, setXray]= useState([]);
  const [tst, setTST]= useState([]);
  const [igra, setIGRA]= useState([]);
  const [dst, setDST]= useState([]);

  useEffect(() => {
    // Load data from Firebase when the component mounts
    loadData();
  }, []);

  const loadData = async () => {
// ROW 1
    //# of patients
    const patientRefCases = await getCountFromServer(query(collection(db, "cases")));
    const patientCounterCases = patientRefCases.data().count;
    setPatientCount(patientCounterCases);
    //# of started treatment
    const patientRefTP = await getCountFromServer(query(collection(db, "treatmentPlan")));
    const patientCounterTP = patientRefTP.data().count;
    const calculateDifference = setsTreatmentCount(Math.abs(patientCounterCases - patientCounterTP));
    
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
  
    //referred patients
    const patientsRef = await getDocs(collection(db, "cases"));
    let patientsData = patientsRef.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    setPatients(patientsData);
    //MTB/RIF tests
    const mtbrifRef = await getDocs(collection(db, "mtbrif"));
    let mtbrifData = mtbrifRef.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    setMTBRIF(mtbrifData);
// ROW 3
    //XRay tests
    const xrayRef = await getDocs(collection(db, "xray"));
    let xrayData = xrayRef.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    setXray(xrayData);
    //TST tests
    const tstRef = await getDocs(collection(db, "tst"));
    let tstData = tstRef.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    setTST(tstData);
    //IGRA tests
    const igraRef = await getDocs(collection(db, "igra"));
    let igraData = igraRef.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    setIGRA(igraData);
    //DST tests
    const dstRef = await getDocs(collection(db, "dst"));
    let dstData = dstRef.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    setDST(dstData);
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
          <StatBox title={sTreatmentCount} subtitle="Not Started on Treatment" />
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

        {/* ROW 2 */}
        <Box
          gridColumn="span 4"
          gridRow="span 2"
          p="16px"
          backgroundColor={colors.primary[400]}
          display="flex"
          flexDirection="column"
          alignItems="center" // Align items vertically
        >
          <Typography
            variant="h3"
            fontWeight="600"
            textAlign="center"
            sx={{ padding: "0px 0px 0px 0px" }}
          >
            Treatment Progress of Patients
          </Typography>
          <Box height="220px" minHeight="150px" marginTop="8px">
            <Doughnut
              data={{
                labels: ["Not Started", "Ongoing", "End"],
                datasets: [
                  {
                    label: "Count",
                    data: [sTreatmentCount, oTreatmentCount, eTreatmentCount],
                    backgroundColor: [
                      "rgb(255, 99, 132)",
                      "rgb(54, 162, 235)",
                      "rgb(255, 205, 86)",
                    ],
                    hoverOffset: 4,
                  },
                ],
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

        <Box
          gridColumn="span 4"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          overflow="auto"
        >
          <Typography
            variant="h3"
            fontWeight="600"
            ml="16px"
            mt="16px"
            mb="8px"
            sx={{ padding: "0px 0px 0px 0px" }}
          >
            Recently Referred Patients
          </Typography>
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
                  {doc.fullName}
                </Typography>
              </Box>
              {/* date referred */}
              <Box color={colors.grey[100]}>
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
        {/* MTBRIF */}
        <Box
          gridColumn="span 4"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          overflow="auto"
        >
          <Typography
            variant="h3"
            fontWeight="600"
            ml="16px"
            mt="16px"
            mb="8px"
            sx={{ padding: "0px 0px 0px 0px" }}
          >
            Recently Added MTB/RIF Tests
          </Typography>
          {mtbrif.map((doc, i) => (
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
                  {doc.referenceNumber}
                </Typography>
              </Box>
              <Box color={colors.grey[100]}>{/* {doc.testDate} */}</Box>
              <Box
                backgroundColor={colors.greenAccent[500]}
                p="5px 10px"
                borderRadius="4px"
              >
                {doc.testResult}
              </Box>
            </Box>
          ))}
        </Box>

        {/* ROW 3 */}
        <Box
          gridColumn="span 4"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          overflow="auto"
        >
          {/* Xray */}
          <Typography
            variant="h3"
            fontWeight="600"
            ml="16px"
            mt="16px"
            mb="8px"
            sx={{ padding: "0px 0px 0px 0px" }}
          >
            Recently Added Xray Tests
          </Typography>
          {xray.map((doc, i) => (
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
                  {doc.referenceNumber}
                </Typography>
              </Box>
              <Box color={colors.grey[100]}>{/* {doc.testDate} */}</Box>
              <Box
                backgroundColor={colors.greenAccent[500]}
                p="5px 10px"
                borderRadius="4px"
              >
                {doc.testResult}
              </Box>
            </Box>
          ))}
        </Box>
        {/* TST */}
        <Box
          gridColumn="span 4"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          overflow="auto"
        >
          <Typography
            variant="h3"
            fontWeight="600"
            ml="16px"
            mt="16px"
            mb="8px"
            sx={{ padding: "0px 0px 0px 0px" }}
          >
            Recently Added TST Tests
          </Typography>
          {tst.map((doc, i) => (
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
                  {doc.referenceNumber}
                </Typography>
              </Box>
              <Box color={colors.grey[100]}>{/* {doc.testDate} */}</Box>
              <Box
                backgroundColor={colors.greenAccent[500]}
                p="5px 10px"
                borderRadius="4px"
              >
                {doc.testResult}
              </Box>
            </Box>
          ))}
        </Box>

        <Box
          gridColumn="span 4"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          overflow="auto"
        >
          <Typography
            variant="h3"
            fontWeight="600"
            ml="16px"
            mt="16px"
            mb="8px"
            sx={{ padding: "0px 0px 0px 0px" }}
          >
            Recently Added IGRA Tests
          </Typography>
          {igra.map((doc, i) => (
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
                  {doc.referenceNumber}
                </Typography>
              </Box>
              <Box color={colors.grey[100]}>{/* {doc.testDate} */}</Box>
              <Box
                backgroundColor={colors.greenAccent[500]}
                p="5px 10px"
                borderRadius="4px"
              >
                {doc.testResult}
              </Box>
            </Box>
          ))}
        </Box>

        <Box
          gridColumn="span 4"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          overflow="auto"
        >
          <Typography
            variant="h3"
            fontWeight="600"
            ml="16px"
            mt="16px"
            mb="8px"
            sx={{ padding: "0px 0px 0px 0px" }}
          >
            Recently Added DST Tests
          </Typography>
          {dst.map((doc, i) => (
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
                  {doc.referenceNumber}
                </Typography>
              </Box>
              <Box color={colors.grey[100]}>{doc.testDate}</Box>
              <Box
                backgroundColor={colors.greenAccent[500]}
                p="5px 10px"
                borderRadius="4px"
              >
                {doc.testResult}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
