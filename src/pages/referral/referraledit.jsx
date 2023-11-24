import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { 
    FormControl, RadioGroup, FormControlLabel, Radio, InputLabel, Select, MenuItem,
    TextField, Button, Box, Divider, FormLabel, Typography, Grid, Container, useTheme
} from '@mui/material';
import { db } from '../../firebase.config';
import { tokens } from "../../theme";

const ReferralEditForm = () => {
    const { referralId } = useParams();
    const navigate = useNavigate();
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    // Initialize state hooks with empty values
    const [referringFacilityName, setReferringFacilityName] = useState('');
    const [referringFacilityContactNumber, setReferringFacilityContactNumber] = useState('');
    const [referringFacilityEmail, setReferringFacilityEmail] = useState('');
    const [referringFacilityAddress, setReferringFacilityAddress] = useState('');
    const [dotsStaffName, setdotsStaffName] = useState('');
    const [dotsStaffContact, setdotsStaffContact] = useState('');
    const [dotsStaffDesignation, setdotsStaffDesignation] = useState('');

    const [reasonForReferral, setReasonForReferral] = useState('');
    const [subReason, setSubReason] = useState('');
    const [bacteriologicalStatus, setBacteriologicalStatus] = useState('');
    const [anatomicalSite, setAnatomicalSite] = useState('');
    const [drugSusceptibility, setDrugSusceptibility] = useState('');
    const [treatmentHistory, setTreatmentHistory] = useState('');
    const [otherReason, setOtherReason] = useState('');

    const [receivingFacilityName, setReceivingFacilityName] = useState('');
    const [receivingFacilityContact, setReceivingFacilityContact] = useState('');
    const [receivingFacilityAddress, setReceivingFacilityAddress] = useState('');
    const [receivingFacilityDateReceived, setReceivingFacilityDateReceived] = useState('');

    const [receivingStaffName, setReceivingStaffName] = useState('');
    const [receivingStaffContact, setReceivingStaffContact] = useState('');
    const [receivingStaffDesignation, setReceivingStaffDesignation] = useState('');

    const [actionTaken, setActionTaken] = useState('');
    const [labTestType, setLabTestType] = useState('');
    const [labTestDate, setLabTestDate] = useState('');
    const [labTestResults, setLabTestResults] = useState('');

    const [treatmentDateRegistered, setTreatmentDateRegistered] = useState('');
    const [treatmentRegimen, setTreatmentRegimen] = useState('');
    const [notTreatedReason, setNotTreatedReason] = useState('');
    const [otherActionSpecification, setOtherActionSpecification] = useState('');

    const [remarks, setRemarks] = useState('');


    useEffect(() => {
        // Fetch the referral data from Firestore
        const fetchReferralData = async () => {
            const docRef = doc(db, "referralform", referralId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                setReferringFacilityName(data.referringFacilityName);
                setReferringFacilityContactNumber(data.referringFacilityContactNumber);
                setReferringFacilityEmail(data.referringFacilityEmail);
                setReferringFacilityAddress(data.referringFacilityAddress);
                setdotsStaffName(data.dotsStaffName);
                setdotsStaffContact(data.dotsStaffContact);
                setdotsStaffDesignation(data.dotsStaffDesignation);
                setReasonForReferral(data.reasonForReferral);
                setSubReason(data.subReason);
                setBacteriologicalStatus(data.bacteriologicalStatus);
                setAnatomicalSite(data.anatomicalSite);
                setDrugSusceptibility(data.drugSusceptibility);
                setTreatmentHistory(data.treatmentHistory);
                setOtherReason(data.otherReason);
                setReceivingFacilityName(data.receivingFacilityName);
                setReceivingFacilityContact(data.receivingFacilityContact);
                setReceivingFacilityAddress(data.receivingFacilityAddress);
                setReceivingFacilityDateReceived(data.receivingFacilityDateReceived);
                setReceivingStaffName(data.receivingStaffName);
                setReceivingStaffContact(data.receivingStaffContact);
                setReceivingStaffDesignation(data.receivingStaffDesignation);
                setActionTaken(data.actionTaken);
                setLabTestType(data.labTestType);
                setLabTestDate(data.labTestDate);
                setLabTestResults(data.labTestResults);
                setTreatmentDateRegistered(data.treatmentDateRegistered);
                setTreatmentRegimen(data.treatmentRegimen);
                setNotTreatedReason(data.notTreatedReason);
                setOtherActionSpecification(data.otherActionSpecification);
                setRemarks(data.remarks);
            } else {
                console.log("No such document!");
                navigate("/referralinfo");
            }
        };

        fetchReferralData();
    }, [referralId, navigate]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        // Form validation and data gathering for update
        const updatedReferralData = {
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
        };

        try {
            const docRef = doc(db, "referralform", referralId);
            await updateDoc(docRef, updatedReferralData);
            console.log("Document updated with ID: ", docRef.id);
            navigate("/referralinfo");
        } catch (e) {
            console.error("Error updating document: ", e);
        }
    };

    const handleCancel = () => {
        navigate("/referralinfo");
    };

    return (
        <Container component="main" maxWidth="md">
            <Typography variant="h4" component="h1" gutterBottom>
                Edit Referral Information
            </Typography>
            <Divider sx={{ mb: 4 }} />

            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <Typography variant="h5" gutterBottom sx={{ color: colors.greenAccent[500], fontWeight: 'bold' }}>
            Referring Facility Information
            </Typography>
            <Grid container spacing={1}>
                {/* Referring Facility Information Inputs */}
                <Grid item xs={12} md={6}>
                <TextField
                    required
                    fullWidth
                    label="Name of Referring Facility/Unit"
                    value={referringFacilityName}
                    onChange={(e) => setReferringFacilityName(e.target.value)}
                    variant="outlined"
                    margin="normal"
                />
                </Grid>
                <Grid item xs={12} md={6}>
                <TextField
                    required
                    fullWidth
                    label="Contact Number"
                    value={referringFacilityContactNumber}
                    onChange={(e) => setReferringFacilityContactNumber(e.target.value)}
                    variant="outlined"
                    margin="normal"
                />
                </Grid>
                <Grid item xs={12} md={6}>
                <TextField
                    required
                    fullWidth
                    label="Email"
                    value={referringFacilityEmail}
                    onChange={(e) => setReferringFacilityEmail(e.target.value)}
                    variant="outlined"
                    margin="normal"
                />
                </Grid>
                <Grid item xs={12} md={6}>
                <TextField
                    required
                    fullWidth
                    label="Address of Referring Facility/Unit"
                    value={referringFacilityAddress}
                    onChange={(e) => setReferringFacilityAddress(e.target.value)}
                    variant="outlined"
                    margin="normal"
                />
                </Grid>
                </Grid>
                <Divider sx={{ bgcolor: colors.grey[500], my: 2 }} />

                {/* Referring DOTS Staff Information Inputs */}
                <Typography variant="h5" gutterBottom sx={{ color: colors.greenAccent[500], fontWeight: 'bold' }}>
                Contact Information
                </Typography>
                <Grid container spacing={1}>
                <Grid item xs={12} md={4}>
                <TextField
                    fullWidth
                    required
                    label="Name"
                    value={dotsStaffName}
                    onChange={(e) => setdotsStaffName(e.target.value)}
                    variant="outlined"
                    margin="normal"
                />
                </Grid>
                <Grid item xs={12} md={4}>
                <TextField
                    fullWidth
                    required
                    label="Contact Number/Email"
                    value={dotsStaffContact}
                    onChange={(e) => setdotsStaffContact(e.target.value)}
                    variant="outlined"
                    margin="normal"
                />
                </Grid>
                <Grid item xs={12} md={4}>
                <TextField
                    fullWidth
                    required
                    label="Designation"
                    value={dotsStaffDesignation}
                    onChange={(e) => setdotsStaffDesignation(e.target.value)}
                    variant="outlined"
                    margin="normal"
                />
                </Grid>
                </Grid>
                <Divider sx={{ bgcolor: colors.grey[500], my: 2 }} />

            {/* Reason for Referral Inputs */}
            <Typography variant="h5" gutterBottom sx={{ color: colors.greenAccent[500], fontWeight: 'bold' }}>
                Reason for Referral
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <FormControl fullWidth>
                        <InputLabel id="reason-for-referral-label">Reason for Referral</InputLabel>
                        <Select
                            labelId="reason-for-referral-label"
                            id="reason-for-referral"
                            value={reasonForReferral}
                            label="Reason for Referral"
                            onChange={(e) => setReasonForReferral(e.target.value)}
                        >
                            <MenuItem value="For Screening">For Screening</MenuItem>
                            <MenuItem value="For Start of TB Treatment">For Start of TB Treatment</MenuItem>
                            <MenuItem value="For Start of TPT">For Start of TPT</MenuItem>
                            <MenuItem value="For Continuation of Treatment/Transfer Out">
                                For Continuation of Treatment/Transfer Out
                            </MenuItem>
                            <MenuItem value="For Continuation of Treatment/Decentralize">
                                For Continuation of Treatment/Decentralize
                            </MenuItem>
                            <MenuItem value="Other">Other/s, Specify</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                {reasonForReferral === "For Screening" && (
                    <Grid item xs={12}>
                        <FormControl fullWidth>
                            <InputLabel id="sub-reason-label">Sub-reason for Screening</InputLabel>
                            <Select
                                labelId="sub-reason-label"
                                id="sub-reason"
                                value={subReason}
                                label="Sub-reason for Screening"
                                onChange={(e) => setSubReason(e.target.value)}
                            >
                                <MenuItem value="TST">Tuberculin Skin Test (TST)</MenuItem>
                                <MenuItem value="BloodTests">TB Blood Tests</MenuItem>
                                <MenuItem value="HighRiskClinical">High-Risk Clinical Group Screening</MenuItem>
                                <MenuItem value="HighRiskPopulation">High-Risk Population Screening</MenuItem>
                                <MenuItem value="NoninvasiveTests">Noninvasive Sample Tests</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                )}
            {reasonForReferral === "For Continuation of Treatment/Decentralize" && (
                <>
                    <Grid item xs={12}>
                        <Typography variant="h5" gutterBottom sx={{ color: colors.greenAccent[500] }}>
                            Additional Information Required
                        </Typography>
                    
                    <Grid container spacing={3}>
                        <Grid item xs={7}>
                            <FormControl component="fieldset">
                                <FormLabel component="legend">Bacteriological Status</FormLabel>
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
                                <FormLabel component="legend">Anatomical Site</FormLabel>
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
                                <FormLabel component="legend">Drug-susceptibility</FormLabel>
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
                                <FormLabel component="legend">Treatment History</FormLabel>
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
                    </Grid>
                </>
                )}
            {reasonForReferral === "Other" && (
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        required
                        label="Please specify other reason"
                        value={otherReason}
                        onChange={(e) => setOtherReason(e.target.value)}
                        />
                    </Grid>
                )}
                </Grid>
                <Divider sx={{ bgcolor: colors.grey[500], my: 2 }} />

                {/* Receiving Facility Information Inputs */}
                <Typography variant="h5" gutterBottom sx={{ color: colors.greenAccent[500], fontWeight: 'bold' }}>
                    Receiving Facility Information
                </Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <TextField
                            required
                            fullWidth
                            label="Name of Receiving Facility/Unit"
                            value={receivingFacilityName}
                            onChange={(e) => setReceivingFacilityName(e.target.value)}
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            required
                            fullWidth
                            label="Contact Number"
                            value={receivingFacilityContact}
                            onChange={(e) => setReceivingFacilityContact(e.target.value)}
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            required
                            fullWidth
                            label="Address of Receiving Facility/Unit"
                            value={receivingFacilityAddress}
                            onChange={(e) => setReceivingFacilityAddress(e.target.value)}
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            required
                            fullWidth
                            label="Date Received"
                            type="date"
                            value={receivingFacilityDateReceived}
                            onChange={(e) => setReceivingFacilityDateReceived(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            variant="outlined"
                        />
                    </Grid>
                </Grid>
                <Divider sx={{ bgcolor: colors.grey[500], my: 2 }} />

                {/* Receiving DOTS Staff Information Inputs */}
                <Typography variant="h5" gutterBottom sx={{ color: colors.greenAccent[500], fontWeight: 'bold' }}>
                    Receiving DOTS Staff Information
                </Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                        <TextField
                            required
                            fullWidth
                            label="Name"
                            value={receivingStaffName}
                            onChange={(e) => setReceivingStaffName(e.target.value)}
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField
                            required
                            fullWidth
                            label="Contact Number/Email"
                            value={receivingStaffContact}
                            onChange={(e) => setReceivingStaffContact(e.target.value)}
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField
                            required
                            fullWidth
                            label="Designation"
                            value={receivingStaffDesignation}
                            onChange={(e) => setReceivingStaffDesignation(e.target.value)}
                            variant="outlined"
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
                                {/* Options from actionTakenOptions */}
                                <MenuItem value="Lab Test Performed">Lab Test Performed</MenuItem>
                                <MenuItem value="Patient Started/Resumed Treatment">Patient Started/Resumed Treatment</MenuItem>
                                <MenuItem value="Not Treated">Not Treated</MenuItem>
                                <MenuItem value="Other">Other</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Lab Test Performed */}
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

                    {/* Patient Started/Resumed Treatment */}
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

                    {/* Not Treated */}
                    {actionTaken === 'Not Treated' && (
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                required
                                label="Reason for Not Treating"
                                margin="dense"
                                value={notTreatedReason}
                                onChange={(e) => setNotTreatedReason(e.target.value)}
                                placeholder="Enter the reason for not treating"
                            />
                        </Grid>
                    )}

                    {/* Other Action */}
                    {actionTaken === 'Other' && (
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                required
                                label="Specify Other Action"
                                margin="dense"
                                value={otherActionSpecification}
                                onChange={(e) => setOtherActionSpecification(e.target.value)}
                                placeholder="Specify the action taken"
                            />
                        </Grid>
                    )}
                </Grid>
                <Divider sx={{ bgcolor: colors.grey[500], my: 2 }} />


            {/* Remarks Section */}
                <Typography variant="h5" gutterBottom sx={{ color: colors.greenAccent[500], fontWeight: 'bold' }}>
                    Remarks
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
                            variant="outlined"
                        />
                    </Grid>
                </Grid>


                {/* Action Buttons */}
                <Grid container justifyContent="center" sx={{ mt: 4 }}>
                    <Button type="submit" variant="contained" sx={{ backgroundColor: colors.greenAccent[600], color: colors.grey[100], mr: 1 }}>
                        Update Referral
                    </Button>
                    <Button variant="outlined" onClick={handleCancel} sx={{ color: colors.grey[100], borderColor: colors.grey[700] }}>
                        Back
                    </Button>
                </Grid>
            </Box>
        </Container>
    );
};

export default ReferralEditForm;
