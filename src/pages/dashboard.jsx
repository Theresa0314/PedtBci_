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
  const tableauVizRef = useRef(null);

  useEffect(() => {
    
    const scriptElement = document.createElement('script');
    scriptElement.src = 'https://public.tableau.com/javascripts/api/viz_v1.js';
    scriptElement.onload = () => {
      const divElement = document.getElementById('viz1712191155443');
      if (divElement) {
        const vizElement = divElement.getElementsByTagName('object')[0];
        if (vizElement) {

            vizElement.style.width = '100%';
            vizElement.style.height = '977px';

          vizElement.style.display = 'block';
        }
      }
    };
    document.body.appendChild(scriptElement);
  }, []);
  

  return (
    <div className='tableauPlaceholder' id='viz1712191155443' style={{ position: 'relative' }}>
      <noscript>
        <a href='#'>
          <img alt='Dashboard 1 ' src='https://public.tableau.com/static/images/Da/Dashboard1_17121908292650/Dashboard1/1_rss.png' style={{ border: 'none' }} />
        </a>
      </noscript>
      <object className='tableauViz' style={{ display: 'none' }}>
        <param name='host_url' value='https%3A%2F%2Fpublic.tableau.com%2F' />
        <param name='embed_code_version' value='3' />
        <param name='site_root' value='' />
        <param name='name' value='Dashboard1_17121908292650/Dashboard1' />
        <param name='tabs' value='no' />
        <param name='toolbar' value='yes' />
        <param name='static_image' value='https://public.tableau.com/static/images/Da/Dashboard1_17121908292650/Dashboard1/1.png' />
        <param name='animate_transition' value='yes' />
        <param name='display_static_image' value='yes' />
        <param name='display_spinner' value='yes' />
        <param name='display_overlay' value='yes' />
        <param name='display_count' value='yes' />
        <param name='language' value='en-US' />
        <param name='filter' value='publish=yes' />
      </object>
    </div>
  );
};

export default Dashboard;
