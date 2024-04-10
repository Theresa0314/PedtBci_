import React, { useState, useEffect } from 'react';
import { Box, Grid, useTheme, Typography, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import Header from '../../components/Header';
import { db } from '../../firebase.config';
import { collection, getDocs } from 'firebase/firestore';
import { tokens } from "../../theme";
import { Line, Bar } from 'react-chartjs-2';

const ReportsPage = () => {
  const [timePeriod, setTimePeriod] = useState('monthly');

  const [patientDemographicsChartData, setPatientDemographicsChartData] = useState({ labels: [], datasets: [] }); 
  const [labTestsChartData, setLabTestsChartData] = useState({ labels: [], datasets: [] });

  const [treatmentStatusChartData, setTreatmentStatusChartData] = useState({
    labels: [],
    datasets: []
  });
  
  const [treatmentOutcomeChartData, setTreatmentOutcomeChartData] = useState({
    labels: [],
    datasets: []
  });

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);


  const handleTimePeriodChange = async (event) => {
    const newTimePeriod = event.target.value;
    setTimePeriod(newTimePeriod);
    await fetchPatientDemographics(newTimePeriod);
    await fetchLabTestsOverTime(newTimePeriod);
    await fetchTreatmentData(newTimePeriod);
    
  };


  const groupByTimePeriod = (data, period = 'monthly') => {
    const grouped = {};
    
    data.forEach(item => {
      const date = new Date(item.testDate);
      let key;
      
      switch (period) {
        case 'yearly':
          key = `${date.getFullYear()}`;
          break;
        case 'quarterly':
          const quarter = Math.floor((date.getMonth() + 3) / 3);
          key = `${date.getFullYear()}-Q${quarter}`;
          break;
        case 'monthly':
        default:
          key = date.toLocaleDateString('en-us', { year: 'numeric', month: 'short' });
          break;
      }
  
      if (!grouped[key]) {
        grouped[key] = 0;
      }
      
      grouped[key]++;
    });
    
    return grouped;
  };

  // Function to calculate age from birthdate
  const calculateAge = (birthdateString) => {
    const birthdate = new Date(birthdateString);
    const today = new Date();
    let age = today.getFullYear() - birthdate.getFullYear();
    const m = today.getMonth() - birthdate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthdate.getDate())) {
      age--;
    }
    return age;
  };
  const determineAgeGroup = (age) => {
    if (age <= 5) return '0-5';
    if (age <= 10) return '6-10';
    if (age <= 15) return '11-15';
    if (age <= 20) return '16-20';
  };
  
  const fetchPatientDemographics = async (selectedTimePeriod = 'monthly') => {
    let rawPatientData = {};
    const querySnapshot = await getDocs(collection(db, "patientsinfo"));
    
    querySnapshot.forEach(doc => {
      const { birthdate, gender, dateAdded } = doc.data();
      const age = calculateAge(birthdate);
      const ageGroup = determineAgeGroup(age);
      const genderKey = gender.toLowerCase();
      
      // Use dateAdded to group by time period
      const date = new Date(dateAdded);
      let dateKey;
      switch (selectedTimePeriod) {
        case 'yearly':
          dateKey = `${date.getFullYear()}`;
          break;
        case 'quarterly':
          const quarter = Math.floor((date.getMonth() + 3) / 3);
          dateKey = `${date.getFullYear()}-Q${quarter}`;
          break;
        case 'monthly':
        default:
          dateKey = date.toLocaleDateString('en-us', { year: 'numeric', month: 'short' });
          break;
      }
  
      if (!rawPatientData[dateKey]) {
        rawPatientData[dateKey] = {};
      }
      
      if (!rawPatientData[dateKey][ageGroup]) {
        rawPatientData[dateKey][ageGroup] = { male: 0, female: 0 };
      }
      
      rawPatientData[dateKey][ageGroup][genderKey]++;
    });
  
    // Transform rawPatientData into the structure needed for charting
    const chartData = transformPatientDataForChart(rawPatientData);
    setPatientDemographicsChartData(chartData);
  };
  
  // Add a new function to transform the patient data into a chart-friendly format
  const transformPatientDataForChart = (patientData) => {
    const ageGroups = ['0-5', '6-10', '11-15', '16-20'];
    const labels = Object.keys(patientData).sort((a, b) => new Date(a) - new Date(b));
    const datasets = ageGroups.flatMap(ageGroup => {
      const maleData = labels.map(label => patientData[label]?.[ageGroup]?.male || 0);
      const femaleData = labels.map(label => patientData[label]?.[ageGroup]?.female || 0);
  
      return [
        {
          label: `${ageGroup} Male`,
          data: maleData,
          backgroundColor: 'blue',
          stack: ageGroup,
        },
        {
          label: `${ageGroup} Female`,
          data: femaleData,
          backgroundColor: 'pink',
          stack: ageGroup,
        }
      ];
    });
  
    return { labels, datasets };
  };
  
  const fetchLabTestsOverTime = async (timePeriod = 'monthly') => {
    // Initialize patientData and labTestData
    let patientData = {};
    let labTestData = {};
  
    // Fetch and prepare patientData
    const patientsSnapshot = await getDocs(collection(db, "patientsinfo"));
    patientsSnapshot.forEach(doc => {
      const patientInfo = doc.data();
      patientData[patientInfo.caseNumber] = patientInfo; // Store entire patient info
    });
  
    // Lab test types to be included in the chart
    const labTestTypes = ['igra', 'mtbrif', 'xray', 'tst', 'dst'];
  
    // Prepare labTestData structure
    labTestTypes.forEach(testType => {
      labTestData[testType] = {};
    });
  
    // Fetch lab test data for each type
    for (let testType of labTestTypes) {
      const querySnapshot = await getDocs(collection(db, testType));
      querySnapshot.forEach(doc => {
        const { caseNumber, testDate } = doc.data();
  
        // Match the test with the patient using caseNumber
        if (patientData[caseNumber]) {
          // Extract the month and year for the X-Axis labels
          const monthYear = new Date(testDate).toLocaleDateString('en-us', { year: 'numeric', month: 'short' });
  
          // Initialize the monthYear key for the testType if it doesn't exist
          if (!labTestData[testType][monthYear]) {
            labTestData[testType][monthYear] = 0;
          }
  
          // Increment the test count for the specific month and year
          labTestData[testType][monthYear]++;
        }
      });
      labTestData[testType] = groupByTimePeriod(Object.entries(labTestData[testType]).map(([date, count]) => ({
        testDate: date,
        count: count
      })), timePeriod);
    }
  
    // Create labels for the X-Axis based on the test dates
    const labels = getUniqueSortedMonthYearKeys(labTestData);
    
  
    // Create datasets for each lab test type
    const datasets = labTestTypes.map(testType => {
      // Map each label (month-year) to the corresponding test count
      const data = labels.map(label => labTestData[testType][label] || 0);
      return {
        label: testType.toUpperCase(),
        data: data,
        borderColor: getRandomColor(),
        fill: false,
      };
    });
  
    // Set the state with the new chart data
    setLabTestsChartData({ labels, datasets });
  };

  function getUniqueSortedMonthYearKeys(labTestData) {
    const allKeys = new Set();
    Object.values(labTestData).forEach(testData => {
      Object.keys(testData).forEach(key => allKeys.add(key));
    });
    return Array.from(allKeys).sort((a, b) => new Date(a) - new Date(b));
  }
  function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
  

  const fetchTreatmentData = async (selectedTimePeriod = 'monthly') => {
    // Initialize status and outcome counts objects
    const treatmentStatusCounts = {
      'Pending': {},
      'Ongoing': {},
      'End': {}
    };
    
    const treatmentOutcomeCounts = {
      'Not Evaluated': {},
      'Cured/Treatment Completed': {},
      'Treatment Failed': {},
      'Died': {},
      'Lost to Follow up': {}
    };
  
    try {
      const querySnapshotTreatment = await getDocs(collection(db, "treatmentPlan"));
      querySnapshotTreatment.forEach((doc) => {
        const data = doc.data();
        const startDate = new Date(data.startDateTP);
  
        // Use the groupByTimePeriod function to group the startDate by the selectedTimePeriod
        let dateKey = startDate.toLocaleDateString('en-us', { year: 'numeric', month: 'short' });
        if (selectedTimePeriod === 'yearly') {
          dateKey = `${startDate.getFullYear()}`;
        } else if (selectedTimePeriod === 'quarterly') {
          const quarter = Math.floor((startDate.getMonth() + 3) / 3);
          dateKey = `${startDate.getFullYear()}-Q${quarter}`;
        }
  
        // Increment status count
        if (!treatmentStatusCounts[data.status][dateKey]) {
          treatmentStatusCounts[data.status][dateKey] = 0;
        }
        treatmentStatusCounts[data.status][dateKey]++;
  
        // Always increment outcome count, regardless of the status
        const outcomeKey = data.outcome || 'Not Evaluated';
        if (!treatmentOutcomeCounts[outcomeKey][dateKey]) {
          treatmentOutcomeCounts[outcomeKey][dateKey] = 0;
        }
        treatmentOutcomeCounts[outcomeKey][dateKey]++;
      });
      
      // Combine all date keys from both status and outcomes, group by the selectedTimePeriod if necessary
      const combinedKeys = new Set(Object.keys(treatmentStatusCounts['Pending'])
        .concat(Object.keys(treatmentStatusCounts['Ongoing']))
        .concat(Object.keys(treatmentStatusCounts['End']))
        .concat(Object.keys(treatmentOutcomeCounts['Not Evaluated']))
        .concat(Object.keys(treatmentOutcomeCounts['Cured/Treatment Completed']))
        .concat(Object.keys(treatmentOutcomeCounts['Treatment Failed']))
        .concat(Object.keys(treatmentOutcomeCounts['Died']))
        .concat(Object.keys(treatmentOutcomeCounts['Lost to Follow up'])));
  
      // Sort the combined keys to create the labels
      const labels = Array.from(combinedKeys).sort((a, b) => new Date(a) - new Date(b));
  
      // Create the datasets for the status chart
      const statusChartData = createChartDataset(labels, treatmentStatusCounts, 'status');
  
      // Create the datasets for the outcome chart
      const outcomeChartData = createChartDataset(labels, treatmentOutcomeCounts, 'outcome');
  
      // Update state with the new chart data
      setTreatmentStatusChartData(statusChartData);
      setTreatmentOutcomeChartData(outcomeChartData);
  
    } catch (error) {
      console.error("Error fetching treatment data:", error);
    }
  };

// Helper function to create the datasets for the chart
function createChartDataset(labels, counts, type) {
  const backgroundColors = {
    'Pending': 'rgba(255, 206, 86, 1)',
    'Ongoing': 'rgba(54, 162, 235, 1)',
    'End': 'rgba(75, 192, 192, 1)',
    'Not Evaluated': 'rgba(255, 159, 64, 1)',
    'Cured/Treatment Completed': 'rgba(153, 102, 255, 1)',
    'Treatment Failed': 'rgba(255, 99, 132, 1)',
    'Died': 'rgba(201, 203, 207, 1)',
    'Lost to Follow up': 'rgba(54, 162, 235, 1)',
  };

  return {
    labels,
    datasets: Object.keys(counts).map((key) => ({
      label: key,
      backgroundColor: backgroundColors[key],
      data: labels.map(label => counts[key][label] || 0),
    })),
  };
}



// Call fetchTreatmentData inside useEffect
useEffect(() => {
  fetchPatientDemographics(timePeriod);
  fetchLabTestsOverTime(timePeriod);
  fetchTreatmentData(timePeriod);
}, [timePeriod]);

  return (
    <Box m={2}>
      <Header title="Report Generation" subtitle="Summary Report" />
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={8} md={3} lg={4}>
          <FormControl fullWidth>
            <InputLabel id="time-period-label">Time Period</InputLabel>
            <Select
              labelId="time-period-label"
              id="time-period"
              value={timePeriod}
              label="Time Period"
              onChange={handleTimePeriodChange}
            >
              <MenuItem value="monthly">Monthly</MenuItem>
              <MenuItem value="quarterly">Quarterly</MenuItem>
              <MenuItem value="yearly">Yearly</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        {/* Other grid items */}
      </Grid>


      <Grid container spacing={2}>


        {/* Patient Demographics Chart */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6" sx={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>Patient Demographics Overview</Typography>
          <div style={{  height: '300px', background: colors.primary[400], padding: '5px' }}>
            <Bar data={patientDemographicsChartData} options={{
              plugins: { legend: { position: 'bottom' } },
              scales: {
                x: { stacked: true },
                y: { stacked: true }
              }
            }} />
          </div>
        </Grid>

         {/* Lab Tests Over Time Chart */}
         <Grid item xs={12} md={6}>
          <Typography variant="h6" sx={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>
            Lab Tests Over Time
          </Typography>
          <div style={{ height: '300px', background: colors.primary[400], padding: '5px' }}>
            <Line data={labTestsChartData} options={{
              plugins: { legend: { position: 'bottom' } },
              responsive: true,
              scales: {
                x: { stacked: true },
                y: {stacked: false}
              }
            }} />
          </div>
        </Grid>
     
  
      {/* Treatment Status Chart */}
      <Grid item xs={12} md={6}>
        <Typography variant="h6" sx={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>
          Treatment Status Overview
        </Typography>
        <div style={{ height: '300px', background: colors.primary[400], padding: '5px' }}>
          <Bar 
            data={treatmentStatusChartData}
            options={{
              plugins: { legend: { position: 'bottom' } },
              scales: {
                x: { stacked: true },
                y: { stacked: true }
              }
            }} 
          />
        </div>
      </Grid>

      {/* Treatment Outcome Chart */}
      <Grid item xs={12} md={6}>
        <Typography variant="h6" sx={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>
          Treatment Outcomes Overview
        </Typography>
        <div style={{ height: '300px', background: colors.primary[400], padding: '5px' }}>
          <Bar 
            data={treatmentOutcomeChartData}
            options={{
              plugins: { legend: { position: 'bottom' } },
              scales: {
                x: { stacked: true },
                y: { stacked: true }
              }
            }} 
          />
        </div>
      </Grid>
    </Grid>
      

      
    </Box>
  );
};

export default ReportsPage;
