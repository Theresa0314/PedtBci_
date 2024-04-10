import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import { db } from '../../firebase.config';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { tokens } from "../../theme";
import { Line, Bar } from 'react-chartjs-2';
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import html2canvas from "html2canvas";
import { Box, Grid, useTheme, Typography, FormControl, InputLabel, Select, MenuItem, Button  } from '@mui/material';


const ReferralReport = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
  
    const [referralTrendsChartData, setReferralTrendsChartData] = useState({
      labels: [],
      datasets: []
    });
    const [timePeriod, setTimePeriod] = useState('monthly'); 
  
    // Define the random color function
    const getRandomColor = () => {
      const letters = '0123456789ABCDEF';
      let color = '#';
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    };

   // Updated to use the timePeriod state for grouping data
const fetchReferralData = async (selectedTimePeriod) => {
    const querySnapshot = await getDocs(collection(db, "patientsinfo"));
    let referralsByMonthAndReason = {};
  
    querySnapshot.forEach(doc => {
      const data = doc.data();
      const { dateAdded, reasonForReferral } = data;
  
      // Determine the correct date key based on the selected time period
      let date = dateAdded.toDate ? dateAdded.toDate() : new Date(dateAdded);
      let dateKey = getDateKey(date, selectedTimePeriod);
  
      if (!referralsByMonthAndReason[dateKey]) {
        referralsByMonthAndReason[dateKey] = {};
      }
  
      if (!referralsByMonthAndReason[dateKey][reasonForReferral]) {
        referralsByMonthAndReason[dateKey][reasonForReferral] = 0;
      }
  
      referralsByMonthAndReason[dateKey][reasonForReferral]++;
    });
  
    return referralsByMonthAndReason;
  };
      const transformReferralDataForChart = (referralData) => {
        // Get all months (labels for the x-axis)
        const months = Object.keys(referralData).sort((a, b) => new Date(a) - new Date(b));
        
        // Get all reasons for referral
        const allReasons = new Set();
        months.forEach(month => {
          Object.keys(referralData[month]).forEach(reason => allReasons.add(reason));
        });
        
        // Create datasets for each reason
        const datasets = Array.from(allReasons).map(reason => {
          const data = months.map(month => referralData[month][reason] || 0);
          return {
            label: reason,
            data: data,
            fill: false,
            borderColor: getRandomColor() 
          };
        });
        
        return { labels: months, datasets };
      };
      
    // Function to determine the date key based on the selected time period
    const getDateKey = (dateAdded, selectedTimePeriod) => {
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
        return dateKey;
    };

    // Update the useEffect hook to include timePeriod when fetching data
    useEffect(() => {
        fetchReferralData(timePeriod).then(referralData => {
            const chartData = transformReferralDataForChart(referralData);
            setReferralTrendsChartData(chartData);
        });
    }, [timePeriod]);

   // Add a new function to handle the download
   const downloadReport = async () => {
    // Fetch data from Firestore
    const querySnapshot = await getDocs(collection(db, "patientsinfo"));
    const tableData = querySnapshot.docs.map(doc => {
      const { dateAdded, referringFacilityName, dotsStaffName, reasonForReferral } = doc.data();
      const date = dateAdded.toDate ? dateAdded.toDate() : new Date(dateAdded);
      return [
        date.toLocaleDateString(), // Format the date to a readable format
        referringFacilityName,
        dotsStaffName,
        reasonForReferral
      ];
    });
  
    // Assuming you want to include a chart in your PDF
    const input = document.getElementById('chartContainer'); 
    html2canvas(input, {
      scale: 2, // Adjust for a suitable resolution
      useCORS: true,
    })
    .then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: "a4"
      });
  
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgProps = pdf.getImageProperties(imgData);
      const imgWidth = pageWidth;
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
  
      // Adjust imgHeight if it's too large to leave space for the table
      const maxImgHeight = pageHeight / 2; // Maximum height for the image
      const adjustedImgHeight = Math.min(imgHeight, maxImgHeight);
  
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, adjustedImgHeight);
  
      // Now add the table below the chart
      const startY = adjustedImgHeight + 10; // Start the table a bit below the chart
  
      pdf.autoTable({
        head: [['Date', 'Referring Facility', 'DOTS Staff', 'Reason For Referral']],
        body: tableData,
        startY: startY,
        theme: 'grid',
        pageBreak: 'auto',
        tableWidth: 'auto',
        showHead: 'everyPage',
        margin: { top: 10, bottom: 10 }
      });
   // Add "END OF REPORTS" text on the last page
   const today = new Date().toLocaleDateString();
   pdf.setFontSize(16);
   pdf.text(`END OF REPORTS (Date Generated: ${today})`, 14, pdf.internal.pageSize.getHeight() - 20);

      pdf.save("referral-report.pdf");
    })
    .catch((err) => {
      console.error("Error generating the chart for PDF", err);
    });
  };
  
    
  // Handler for changing the time period
  const handleTimePeriodChange = (event) => {
    setTimePeriod(event.target.value);
  };

  // Render the component
  return (
    <Box m={2}>
      <Header title="Referral Report Generation" subtitle="Visual Summary Report" />
      
      <Grid container spacing={2} alignItems="center" justifyContent="space-between">
      <Grid item xs={12} sm={6} md={4} lg={3}>
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

        <Grid item>
        <Button
          variant="contained"
          startIcon={<DownloadOutlinedIcon />}
          sx={{backgroundColor: colors.blueAccent[700], color: colors.grey[100], fontSize: "14px", fontWeight: "bold", padding: "10px 20px",}}
          onClick={downloadReport}
        >
          Download FULL Report
        </Button>
      </Grid>


      </Grid>


      <Grid item xs={12}>
      <Typography 
            variant="h6" 
            sx={{ 
                fontSize: '20px', 
                fontWeight: 'bold', 
                marginBottom: '1px',
                display: 'flex',
                justifyContent: 'center'  
            }}
        >
            Referral Trends Over Time
        </Typography>
      <div id="chartContainer" style={{ height: '350px', padding: '5px', backgroundColor: colors.primary[400] }}>
     
        <Line 
            data={referralTrendsChartData} 
            options={{
            plugins: { legend: { position: 'bottom' } },
            responsive: true,
            maintainAspectRatio: false, 
            scales: {
                x: { stacked: true },
                y: { stacked: false }
            }
            }} 
        />
        </div>

        </Grid>

    </Box>
  );
};

export default ReferralReport;