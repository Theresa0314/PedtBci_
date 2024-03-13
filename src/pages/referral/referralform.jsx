import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    FormControl, RadioGroup, FormControlLabel, Radio, InputLabel, Select, MenuItem, FormHelperText,
    TextField, Button, Box, Divider, Typography, Grid, Container, useTheme} from '@mui/material';
import { collection, getDocs,  addDoc } from 'firebase/firestore';
import { db } from '../../firebase.config';
import { tokens } from "../../theme";

const ReferralForm = () => {
    const [caseNumber, setCaseNumber] = useState('CN-');
    const [caseNumberError, setCaseNumberError] = useState('');
    const [validCaseNumbers, setValidCaseNumbers] = useState(new Set());
    const [formFieldsVisible, setFormFieldsVisible] = useState(false);

    const [reasonForReferral, setReasonForReferral] = useState('');
    const [referralError, setReferralError] = useState('');
    const [otherReason, setOtherReason] = useState('');
    

    const [referringFacilityName, setReferringFacilityName] = useState('');
    const [referringFacilityContactNumber, setReferringFacilityContactNumber] = useState('');
    const [referringFacilityEmail, setReferringFacilityEmail] = useState('');
    const [referringFacilityAddress, setReferringFacilityAddress] = useState('');

    const [dotsStaffName, setdotsStaffName] = useState('');
    const [dotsStaffContact, setdotsStaffContact] = useState('');
    const [dotsStaffDesignation, setdotsStaffDesignation] = useState('');

    const [bacteriologicalStatus, setBacteriologicalStatus] = useState('');
    const [anatomicalSite, setAnatomicalSite] = useState('');
    const [drugSusceptibility, setDrugSusceptibility] = useState('');
    const [treatmentHistory, setTreatmentHistory] = useState('');

    const [subReason, setSubReason] = useState('');


    const [receivingFacilityName, setReceivingFacilityName] = useState('');
    const [receivingFacilityContact, setReceivingFacilityContact] = useState('');
    const [receivingFacilityAddress, setReceivingFacilityAddress] = useState('');
    const [receivingFacilityDateReceived, setReceivingFacilityDateReceived] = useState('');


    const [receivingStaffName, setReceivingStaffName] = useState('');
    const [receivingStaffContact, setReceivingStaffContact] = useState('');
    const [receivingStaffDesignation, setReceivingStaffDesignation] = useState('');

    const [actionTaken, setActionTaken] = useState('');
    const [remarks, setRemarks] = useState('');

    const [labTestType, setLabTestType] = useState('');
    const [labTestDate, setLabTestDate] = useState('');
    const [labTestResults, setLabTestResults] = useState('');

    const [treatmentDateRegistered, setTreatmentDateRegistered] = useState('');
    const [treatmentRegimen, setTreatmentRegimen] = useState('');
    const [notTreatedReason, setNotTreatedReason] = useState('');
    const [otherActionSpecification, setOtherActionSpecification] = useState('');
    

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const navigate = useNavigate();

    const reasons = [
        'For Screening',
        'For Start of TB Treatment',
        'For start of TPT',
        'For Continuation of Treatment/Transfer Out',
        'For Continuation of Treatment/Decentralize',
        'Other/s, Specify'
    ];

    const actionTakenOptions = [
        'Lab Test Performed',
        'Patient Started/Resumed Treatment',
        'Not Treated',
        'Other',
    ];

  useEffect(() => {
    // Fetch all case numbers from patientsinfo to validate against
    const fetchCaseNumbers = async () => {
      const querySnapshot = await getDocs(collection(db, "patientsinfo"));
      const caseNumbers = new Set(querySnapshot.docs.map((doc) => doc.data().caseNumber));
      setValidCaseNumbers(caseNumbers);
    };
    fetchCaseNumbers();
  }, []);

  const handleCaseNumberChange = (event) => {
    const input = event.target.value.toUpperCase();
    const formattedCaseNumber = input.startsWith('CN-') ? input : `CN-${input}`;
    setCaseNumber(formattedCaseNumber);
    // Check the validity as user types
    if (validCaseNumbers.has(formattedCaseNumber)) {
      setFormFieldsVisible(true);
      setCaseNumberError('');
    } else {
      setFormFieldsVisible(false);
      if (input !== 'CN-') {
        setCaseNumberError('Invalid case number. Please try again.');
      }
    }
  };

  const handleOtherReasonChange = (event) => {
    setOtherReason(event.target.value);
  };

  const handleReasonChange = (event) => {
    setReasonForReferral(event.target.value);
    setSubReason(''); // Reset sub-reason when main reason changes
    
  };

  const handleSubReasonChange = (event) => {
    setSubReason(event.target.value);
  };

    // Define the sub-reasons for each main reason
    const subReasons = {
        "For Screening": [
        "Tuberculin Skin Test (TST)",
        "TB Blood Tests",
        "High-Risk Clinical Group Screening",
        "High-Risk Population Screening",
        "Noninvasive Sample Tests"
        ],
    };

    // Get the current date and time in Philippine time
     const dateReferred = new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' });   

    const handleFormSubmit = async (event) => {
    event.preventDefault();
    if (formFieldsVisible) {
        // Define the data object to save
        const referralData = {
        caseNumber,
        //referral info
        referringFacilityName,
        referringFacilityContactNumber,
        referringFacilityEmail,
        referringFacilityAddress,
        dotsStaffName,
        dotsStaffContact,
        dotsStaffDesignation,

        //reason
        reasonForReferral,
        subReason,
        bacteriologicalStatus,
        anatomicalSite,
        drugSusceptibility,
        treatmentHistory,
        otherReason,

        //receiving info
        receivingFacilityName,
        receivingFacilityContact,
        receivingFacilityAddress,
        receivingFacilityDateReceived,
        receivingStaffName,
        receivingStaffContact,
        receivingStaffDesignation,

        actionTaken,
        labTestType,
        labTestDate,
        labTestResults,
        treatmentDateRegistered,
        treatmentRegimen,
        notTreatedReason,
        otherActionSpecification,

        remarks,
        dateReferred, // Add the generated date referred
        caseStatus: 'Pending', 
        };

    try {
      const docRef = await addDoc(collection(db, "referralform"), referralData);
      console.log("Document written with ID: ", docRef.id);
      navigate("/referralinfo");
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  }
};

  const handleCancel = () => {
    navigate("/referralinfo");
};
  const drawerWidth = 240;

  return (
<Container
    component="main"
    sx={{
        backgroundColor: colors.blueAccent[800],
        padding: theme.spacing(5),
        borderRadius: theme.shape.borderRadius,
        height: '90vh', 
              width: "80%",
              overflow: 'auto', 
        boxSizing: 'border-box',
        transition: theme.transitions.create(['margin', 'width'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        }}
        >
      <Typography variant="h2" gutterBottom sx={{ color: colors.white, fontWeight: 'bold' }}>
        Referral Form
      </Typography>

      <Box component="form" noValidate autoComplete="off" onSubmit={handleFormSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              label="TB/TPT Case Number"
              margin="dense"
              value={caseNumber}
              onChange={handleCaseNumberChange}
              error={!!caseNumberError}
              helperText={caseNumberError || "Start typing the case number after 'CN-'."}
              placeholder="CN-"
            />
          </Grid>
          </Grid>
          {formFieldsVisible && (
            <>
          <Divider sx={{ bgcolor: colors.grey[500], my: 2 }} />
            {/* Referring Facility Information Section */}

            <Typography variant="h5" gutterBottom sx={{ color: colors.greenAccent[500], fontWeight: 'bold' }}>
                Referring Facility Information
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={6}>
                <TextField
                required
                fullWidth
                label="Name of Referring Facility/Unit"
                name="referringFacilityName"
                margin="dense"
                value={referringFacilityName}
                onChange={(e) => setReferringFacilityName(e.target.value)}
                />

                </Grid>
                <Grid item xs={6}>
                <TextField
                    required
                    fullWidth
                    label="Contact Number"
                    name="referringFacilityContactNumber"
                    margin="dense"
                    value={referringFacilityContactNumber}
                    onChange={(e) => setReferringFacilityContactNumber(e.target.value)}
                />
                </Grid>
                <Grid item xs={6}>
                <TextField
                    required
                    fullWidth
                    label="Email"
                    name="referringFacilityEmail"
                    margin="dense"
                    value={referringFacilityEmail}
                    onChange={(e) => setReferringFacilityEmail(e.target.value)}
                />
                </Grid>
                <Grid item xs={6}>
                <TextField
                    required
                    fullWidth
                    label="Address of Referring Facility/Unit"
                    name="referringFacilityAddress"
                    margin="dense"
                    value={referringFacilityAddress}
                    onChange={(e) => setReferringFacilityAddress(e.target.value)}
                />
                </Grid>
                </Grid>
                <Divider sx={{ bgcolor: colors.grey[500], my: 2 }} />

                 {/* Referring DOTS Staff Information Inputs */}
     
                    <Typography variant="h5" gutterBottom sx={{ color: colors.greenAccent[500], fontWeight: 'bold' }}>
                         Referring DOTS Staff Information
                    </Typography>
                    <Grid container spacing={3}>
                    <Grid item xs={4}>
                        <TextField
                        fullWidth
                        required
                        name="dotsStaffName"
                        label="Name"
                        value={dotsStaffName}
                        onChange={(e) => setdotsStaffName(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={4}>
                        <TextField
                        fullWidth
                        required
                        name="dotsStaffContact"
                        label="Contact Number/Email"
                        value={dotsStaffContact}
                        onChange={(e) => setdotsStaffContact(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={4}>
                        <TextField
                        fullWidth
                        required
                        name="dotsStaffDesignation"
                        label="Designation"
                        value={dotsStaffDesignation}
                        onChange={(e) => setdotsStaffDesignation(e.target.value)}
                        />
                    </Grid>
                    </Grid>
                    <Divider sx={{ bgcolor: colors.grey[500], my: 2 }} />


                    <Typography variant="h5" gutterBottom sx={{ color: colors.greenAccent[500], fontWeight: 'bold' }}>
                    Reason for Referral
                    </Typography>
                <Grid container spacing={3}>
                <Grid item xs={12} >
                    {/* Reason for Referral Section */}
                    <FormControl fullWidth error={!!referralError}>
                        <InputLabel id="reason-for-referral-label">Reason for Referral</InputLabel>
                        <Select
                        labelId="reason-for-referral-label"
                        id="reason-for-referral"
                        value={reasonForReferral}
                        label="Reason for Referral"
                        onChange={handleReasonChange}
                        >
                        {reasons.map((reason, index) => (
                            <MenuItem key={index} value={reason}>{reason}</MenuItem>
                        ))}
                        </Select>
                        <FormHelperText>{referralError}</FormHelperText>
                    </FormControl>
                </Grid>
                </Grid>
                {reasonForReferral === "For Screening" && (
                    <Grid item xs={12}>
                    <FormControl fullWidth>
                        <InputLabel id="sub-reason-label">Additional Screening Details</InputLabel>
                        <Select
                        labelId="sub-reason-label"
                        id="sub-reason"
                        value={subReason}
                        label="Additional Screening Details"
                        onChange={handleSubReasonChange}
                        >
                        {subReasons[reasonForReferral].map((option, index) => (
                            <MenuItem key={index} value={option}>{option}</MenuItem>
                        ))}
                        </Select>
                    </FormControl>
                    </Grid>
                    
                )}
                {reasonForReferral === "For Continuation of Treatment/Decentralize" && (
                        <>
                        <Grid item xs={12}>
                        <Typography variant="h5" gutterBottom sx={{ color: colors.greenAccent[500]}}>
                            Additional Information Required
                            </Typography>
                        </Grid>
                        <Grid container spacing={3}>
                        <Grid item xs={7}>
                            <FormControl component="fieldset">
                            <Typography>Bacteriological Status</Typography>
                            <RadioGroup
                                row
                                name="bacteriologicalStatus"
                                value={bacteriologicalStatus}
                                onChange={(e) => setBacteriologicalStatus(e.target.value)}
                            >
                                <FormControlLabel value="BC" control={<Radio />} label="Bacteriologically Confirmed" />
                                <FormControlLabel value="CD" control={<Radio />} label="Clinically Diagnosed" />
                            </RadioGroup>
                            </FormControl>
                        </Grid>

                        <Grid item xs={5}>
                            <FormControl component="fieldset">
                            <Typography>Anatomical Site</Typography>
                            <RadioGroup
                                row
                                name="anatomicalSite"
                                value={anatomicalSite}
                                onChange={(e) => setAnatomicalSite(e.target.value)}
                            >
                                <FormControlLabel value="P" control={<Radio />} label="Pulmonary" />
                                <FormControlLabel value="EP" control={<Radio />} label="Extrapulmonary" />
                            </RadioGroup>
                            </FormControl>
                        </Grid>

                        <Grid item xs={7}>
                            <FormControl component="fieldset">
                            <Typography>Drug-susceptibility</Typography>
                            <RadioGroup
                                row
                                name="drugSusceptibility"
                                value={drugSusceptibility}
                                onChange={(e) => setDrugSusceptibility(e.target.value)}
                            >
                                <FormControlLabel value="DS" control={<Radio />} label="Drug-susceptible" />
                                <FormControlLabel value="DR" control={<Radio />} label="Drug-resistant" />
                                <FormControlLabel value="Unk" control={<Radio />} label="Unknown" />
                            </RadioGroup>
                            </FormControl>
                        </Grid>

                        <Grid item xs={5}>
                            <FormControl component="fieldset">
                            <Typography>Treatment History</Typography>
                            <RadioGroup
                                row
                                name="treatmentHistory"
                                value={treatmentHistory}
                                onChange={(e) => setTreatmentHistory(e.target.value)}
                            >
                                <FormControlLabel value="New" control={<Radio />} label="New" />
                                <FormControlLabel value="Retreatment" control={<Radio />} label="Retreatment" />
                            </RadioGroup>
                            </FormControl>
                        </Grid>
                        </Grid>
                        </>
                    )}  
                    {reasonForReferral === "Other/s, Specify" && (
                    <Grid item xs={12}>
                        <TextField
                        fullWidth
                        required
                        name="otherReason"
                        label="Please specify other reason"
                        margin="dense"
                        value={otherReason}
                        onChange={handleOtherReasonChange}
                        />
                    </Grid>
                    )}           
                <Divider sx={{ bgcolor: colors.grey[500], my: 2 }} />

                {/* Receiving Facility Information Section */}

                <Typography variant="h5" gutterBottom sx={{ color: colors.greenAccent[500], fontWeight: 'bold' }}>
                        Receiving Facility Information
                        </Typography>
                <Grid container spacing={3}>
                    <Grid item xs={6}>
                        <TextField
                        fullWidth
                        required
                        label="Name of Receiving Unit"
                        name="receivingFacilityName"
                        margin="dense"
                        value={receivingFacilityName}
                        onChange={(e) => setReceivingFacilityName(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                        fullWidth
                        required
                        label="Date Received"
                        name="receivingFacilityDateReceived"
                        type="date"
                        margin="dense"
                        InputLabelProps={{
                            shrink: true,
                        }}
                        value={receivingFacilityDateReceived}
                        onChange={(e) => setReceivingFacilityDateReceived(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                        fullWidth
                        required
                        label="Contact Number"
                        name="receivingFacilityContact"
                        margin="dense"
                        value={receivingFacilityContact}
                        onChange={(e) => setReceivingFacilityContact(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                        fullWidth
                        required
                        label="Full Address of Receiving Unit"
                        name="receivingFacilityAddress"
                        margin="dense"
                        value={receivingFacilityAddress}
                        onChange={(e) => setReceivingFacilityAddress(e.target.value)}
                        />
                    </Grid>
                    </Grid>
                    <Divider sx={{ bgcolor: colors.grey[500], my: 2 }} />

                    {/* Receiving DOTS Staff Information Section */}

                    <Typography variant="h5" gutterBottom sx={{ color: colors.greenAccent[500], fontWeight: 'bold' }}>
                        Receiving DOTS Staff Information
                        </Typography>

                    <Grid container spacing={3}>
                        <Grid item xs={6}>
                        <TextField
                        fullWidth
                        required
                        label="Name"
                        name="receivingStaffName"
                        margin="dense"
                        value={receivingStaffName}
                        onChange={(e) => setReceivingStaffName(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                        fullWidth
                        required
                        label="Contact Number/Email"
                        name="receivingStaffContact"
                        margin="dense"
                        value={receivingStaffContact}
                        onChange={(e) => setReceivingStaffContact(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                        fullWidth
                        required
                        label="Designation"
                        name="receivingStaffDesignation"
                        margin="dense"
                        value={receivingStaffDesignation}
                        onChange={(e) => setReceivingStaffDesignation(e.target.value)}
                        />
                    </Grid>
                    </Grid>
                    <Divider sx={{ bgcolor: colors.grey[500], my: 2 }} />


                    {/* Action Taken Section */}
                    <Typography variant="h5" gutterBottom sx={{ color: colors.greenAccent[500], fontWeight: 'bold' }}>
                    Action Taken
                    </Typography> 
                    <Grid container spacing={3}>
                    <Grid item xs={12}>
                    <FormControl fullWidth>
                        <InputLabel id="action-taken-label">Action Taken</InputLabel>
                        <Select
                            labelId="action-taken-label"
                            id="action-taken"
                            value={actionTaken}
                            label="Action Taken"
                            onChange={(e) => setActionTaken(e.target.value)}
                        >
                            {actionTakenOptions.map((action, index) => (
                                <MenuItem key={index} value={action}>{action}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    </Grid>
                    </Grid>
               

                {actionTaken === 'Lab Test Performed' && (
                    <>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Type of Test Performed"
                                margin="dense"
                                value={labTestType}
                                onChange={(e) => setLabTestType(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Date of Test"
                                type="date"
                                margin="dense"
                                InputLabelProps={{ shrink: true }}
                                value={labTestDate}
                                onChange={(e) => setLabTestDate(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Results"
                                margin="dense"
                                value={labTestResults}
                                onChange={(e) => setLabTestResults(e.target.value)}
                            />
                        </Grid>
                    </>
                )}

                {actionTaken === 'Patient Started/Resumed Treatment' && (
                    <>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Date Registered/Resumed"
                                type="date"
                                margin="dense"
                                InputLabelProps={{ shrink: true }}
                                value={treatmentDateRegistered}
                                onChange={(e) => setTreatmentDateRegistered(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Regimen"
                                margin="dense"
                                value={treatmentRegimen}
                                onChange={(e) => setTreatmentRegimen(e.target.value)}
                            />
                        </Grid>
                    </>
                )}

                {actionTaken === 'Not Treated' && (
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            required
                            label="Reason for Not Treating"
                            name="notTreatedReason"
                            margin="dense"
                            value={notTreatedReason}
                            onChange={(e) => setNotTreatedReason(e.target.value)}
                            placeholder="Enter the reason for not treating"
                        />
                    </Grid>
                )}

                {actionTaken === 'Other' && (
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            required
                            label="Specify Other Action"
                            name="otherActionSpecification"
                            margin="dense"
                            value={otherActionSpecification}
                            onChange={(e) => setOtherActionSpecification(e.target.value)}
                            placeholder="Specify the action taken"
                        />
                    </Grid>
                )}
                {/* Remarks Section */}
                

                <Typography variant="h5" gutterBottom sx={{ color: colors.greenAccent[500], fontWeight: 'bold' }}>
                Remark/s
                </Typography> 

                <Grid container spacing={3}>
                   <Grid item xs={12}> 
                    <TextField
                        fullWidth
                        label="Additional Notes"
                        name="remarks"
                        margin="dense"
                        multiline
                        rows={4}
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        placeholder="Enter any additional notes here"
                    />
                </Grid>
            </Grid>
                </>
                )}
                <Grid container justifyContent="center" sx={{ mt: 4 }}>
                    <Button type="submit" variant="contained" sx={{ backgroundColor: colors.greenAccent[600], color: colors.grey[100], mr: 1 }}>
                       Submit Referral
                    </Button>
                    <Button variant="outlined" onClick={handleCancel} sx={{ color: colors.grey[100], borderColor: colors.grey[700] }}>
                        Back
                    </Button>
          </Grid>

      </Box>
    </Container>
  );
};

export default ReferralForm;
