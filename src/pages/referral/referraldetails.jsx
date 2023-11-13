import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase.config';
import {
  Box, Typography, CircularProgress, Container, Card, CardContent, Divider, useTheme
} from '@mui/material';
import Header from '../../components/Header';
import { tokens } from '../../theme';

const ReferralDetails = () => {
  const { caseNumber } = useParams(); // Use the referral ID from the URL
  const [referralData, setReferralData] = useState(null);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  useEffect(() => {
    const fetchReferralData = async () => {
      const docRef = doc(db, "referralform", caseNumber);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setReferralData(docSnap.data());
      } else {
        console.log("No such referral!");
      }
      setLoading(false);
    };

    fetchReferralData();
  }, [caseNumber]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Header title="Referral Details" />
      {referralData ? (
        <Card raised sx={{ backgroundColor: colors.primary[400], mb: 4 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom sx={{ color: colors.greenAccent[500], fontWeight: 'bold' }}>
              Referral Information
            </Typography>
            <Divider sx={{ bgcolor: colors.grey[500], my: 2 }} />
            {/* Display referral details here */}
          </CardContent>
        </Card>
      ) : (
        <Typography variant="h6" sx={{ color: colors.redAccent[500] }}>
          No referral information available.
        </Typography>
      )}
    </Container>
  );
};

export default ReferralDetails;
