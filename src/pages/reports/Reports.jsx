import React, { useState, useEffect } from 'react';
import { Box, Grid, useTheme, Typography } from '@mui/material';
import Header from '../../components/Header';
import { db } from '../../firebase.config';
import { collection, getDocs } from 'firebase/firestore';
import { tokens } from "../../theme";
import { Line, Bar } from 'react-chartjs-2';

const ReportsPage = () => {
  const [lineChartData, setLineChartData] = useState({});
  const [ageDistributionData, setAgeDistributionData] = useState({});
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

// Function to fetch data from Firebase and process for line chart and age distribution histogram
const fetchReportsData = async () => {
  const malePatientCounts = {};
  const femalePatientCounts = {};
  const ageDistribution = {
    '0-5': { male: 0, female: 0 },
    '6-10': { male: 0, female: 0 },
    '11-15': { male: 0, female: 0 },
    '16-20': { male: 0, female: 0 },
    '21-25': { male: 0, female: 0 },
  };
  const totalPatientsOverTime = {};
  const totalMalePatientsOverTime = {};
  const totalFemalePatientsOverTime = {};

  try {
    const querySnapshot = await getDocs(collection(db, "patientsinfo"));
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const dateAdded = new Date(data.dateAdded);
      const monthYearKey = `${dateAdded.getMonth() + 1}-${dateAdded.getFullYear()}`;
      const gender = data.gender.toLowerCase(); // Normalize gender to lowercase
      const age = calculateAge(data.birthdate);

      // Update patient counts by gender
      if (gender === 'male') {
        if (!malePatientCounts[monthYearKey]) {
          malePatientCounts[monthYearKey] = 0;
        }
        malePatientCounts[monthYearKey]++;
      } else if (gender === 'female') {
        if (!femalePatientCounts[monthYearKey]) {
          femalePatientCounts[monthYearKey] = 0;
        }
        femalePatientCounts[monthYearKey]++;
      }

      // Update age distribution
      if (age >= 0 && age <= 5) {
        ageDistribution['0-5'][gender]++;
      } else if (age >= 6 && age <= 10) {
        ageDistribution['6-10'][gender]++;
      } else if (age >= 11 && age <= 15) {
        ageDistribution['11-15'][gender]++;
      } else if (age >= 16 && age <= 20) {
        ageDistribution['16-20'][gender]++;
      } else if (age >= 21 && age <= 25) {
        ageDistribution['21-25'][gender]++;
      }

      // Update total patients over time
      if (!totalPatientsOverTime[monthYearKey]) {
        totalPatientsOverTime[monthYearKey] = 0;
      }
      totalPatientsOverTime[monthYearKey]++;

      // Update total male patients over time
      if (gender === 'male') {
        if (!totalMalePatientsOverTime[monthYearKey]) {
          totalMalePatientsOverTime[monthYearKey] = 0;
        }
        totalMalePatientsOverTime[monthYearKey]++;
      }

      // Update total female patients over time
      if (gender === 'female') {
        if (!totalFemalePatientsOverTime[monthYearKey]) {
          totalFemalePatientsOverTime[monthYearKey] = 0;
        }
        totalFemalePatientsOverTime[monthYearKey]++;
      }
    });

    // Prepare data for age distribution histogram
    const ageDistributionChartData = {
      labels: Object.keys(ageDistribution).filter(age => Object.values(ageDistribution[age]).some(count => count > 0)),
      datasets: [
        {
          label: 'Male Patients',
          backgroundColor: 'blue',
          borderWidth: 1,
          data: Object.keys(ageDistribution).filter(age => Object.values(ageDistribution[age]).some(count => count > 0)).map(age => ageDistribution[age].male),
        },
        {
          label: 'Female Patients',
          backgroundColor: 'pink',
          borderWidth: 1,
          data: Object.keys(ageDistribution).filter(age => Object.values(ageDistribution[age]).some(count => count > 0)).map(age => ageDistribution[age].female),
        },
      ],
    };

    // Prepare data for line chart (total patients over time)
    const lineChartData = {
      labels: Object.keys(totalPatientsOverTime),
      datasets: [
        {
          label: 'Total Patients',
          data: Object.values(totalPatientsOverTime),
          fill: false,
          borderColor: 'green',
          tension: 0.1
        },
        {
          label: 'Male Patients',
          data: Object.values(totalMalePatientsOverTime),
          fill: false,
          borderColor: 'blue',
          tension: 0.1
        },
        {
          label: 'Female Patients',
          data: Object.values(totalFemalePatientsOverTime),
          fill: false,
          borderColor: 'pink',
          tension: 0.1
        }
      ]
    };

    setAgeDistributionData(ageDistributionChartData);
    setLineChartData(lineChartData);
  } catch (error) {
    console.error("Error fetching reports data:", error);
  }
};


const fetchTreatmentData = async () => {
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
      const monthYearKey = `${startDate.getMonth() + 1}-${startDate.getFullYear()}`;

      // Increment status count
      if (!treatmentStatusCounts[data.status][monthYearKey]) {
        treatmentStatusCounts[data.status][monthYearKey] = 0;
      }
      treatmentStatusCounts[data.status][monthYearKey]++;

      // Always increment outcome count, regardless of the status
      const outcomeKey = data.outcome || 'Not Evaluated';
      if (!treatmentOutcomeCounts[outcomeKey][monthYearKey]) {
        treatmentOutcomeCounts[outcomeKey][monthYearKey] = 0;
      }
      treatmentOutcomeCounts[outcomeKey][monthYearKey]++;
    });
    
    // Combine all month-year keys from both status and outcomes
    const combinedKeys = new Set([
      ...Object.keys(treatmentStatusCounts['Pending']),
      ...Object.keys(treatmentStatusCounts['Ongoing']),
      ...Object.keys(treatmentStatusCounts['End']),
      ...Object.keys(treatmentOutcomeCounts['Not Evaluated']),
      ...Object.keys(treatmentOutcomeCounts['Cured/Treatment Completed']),
      ...Object.keys(treatmentOutcomeCounts['Treatment Failed']),
      ...Object.keys(treatmentOutcomeCounts['Died']),
      ...Object.keys(treatmentOutcomeCounts['Lost to Follow up']),
    ]);

    // Sort the combined keys to create the labels
    const labels = Array.from(combinedKeys).sort((a, b) => 
      new Date(a.split('-')[1], a.split('-')[0]) - 
      new Date(b.split('-')[1], b.split('-')[0])
    );

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


// Define your colors outside of the function
const outcomeColors = {
  'Not Evaluated': 'rgba(255, 159, 64, 1)',
  'Cured/Treatment Completed': 'rgba(153, 102, 255, 1)',
  'Treatment Failed': 'rgba(255, 99, 132, 1)',
  'Died': 'rgba(201, 203, 207, 1)',
  'Lost to Follow up': 'rgba(54, 162, 235, 1)',
  // Add any additional outcome colors here
};

// Call fetchTreatmentData inside useEffect
useEffect(() => {
  fetchReportsData();
  fetchTreatmentData();
}, []);

  return (
    <Box m={2}>
      <Header title="Report Generation" subtitle="Summary Report" />

      <Grid container spacing={2}>
      <Grid item xs={12} sx={{ textAlign: 'center', marginBottom: '10px' }}> {/* Add spacing */}
        <Typography variant="h6" sx={{ fontSize: '25px', fontWeight: 'bold' }}> 
        Overall Patient Trends and Age Distribution by Gender
          </Typography>
      </Grid>
        <Grid item xs={12} md={6}>
          {/* Line Chart */}
          <div style={{ width: '100%', height: '300px', background:  colors.primary[400], padding: '5px' }}>
            {lineChartData.labels ? (
              <Line data={lineChartData} options={{ plugins: { legend: { position: 'bottom' } } }} />
            ) : (
              <p>Loading chart data...</p>
            )}
          </div>
        </Grid>
        <Grid item xs={12} md={6}>
          {/* Age Distribution Histogram */}
          <div style={{ width: '100%', height: '300px', background:  colors.primary[400], padding: '5px' }}>
            {ageDistributionData.labels ? (
              <Bar data={ageDistributionData} options={{ plugins: { legend: { position: 'bottom' } } }} />
            ) : (
              <p>Loading age distribution data...</p>
            )}
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
