import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Route,
} from "react-router-dom";
import Protected from "./components/Protected";
import Login from "./pages/auth/login";
import Signup from "./pages/auth/signup";

import Dashboard from "./pages/dashboard";
import UserList from "./pages/users/userlist";
import TBMasterlist from "./pages/tbmasterlist";

import Symptoms from "./pages/symptoms";
import Contacts from "./pages/contacts";
import ReportPage from "./pages/reports/ReportPage";

import Calendar from "./pages/calendar";

import PatientInfo from "./pages/patientinfo/patientInfo";
import PatientGenForm from "./pages/patientinfo/patientgenform";
import PatientDetail from "./pages/patientinfo/patientdetail";
import PatientEdit from "./pages/patientinfo/patientedit";
import CaseDetail from "./pages/patientinfo/casedetail";

import ReferralInfo from "./pages/referral/referralinfo";
import ReferralForm from './pages/referral/referralform';
import ReferralDetails from './pages/referral/referraldetails';
import ReferralEdit from "./pages/referral/referraledit";

import Inventory from "./pages/inventory";

import TPForm from "./pages/treatmentPlan/TPform";
import TPDetail from "./pages/treatmentPlan/TPdetail";
import TPEdit from "./pages/treatmentPlan/TPedit";

import { Form } from "react-router-dom";
import { Bar, Pie, Line } from "react-chartjs-2";



const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />

      <Route path="/" element={ <Protected /> } >
        <Route path="/" element={ <Dashboard /> } />
        <Route path="/userlist" element={< UserList/>} />
        <Route path="/tbmasterlist" element={< TBMasterlist/>} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/p-report" element={<ReportPage/>} />

        <Route path="/patientInfo" element={<PatientInfo />} />
        <Route path="/patientgenform" element={<PatientGenForm />} />
        <Route path="/patientInfo/:caseNumber" element={<PatientDetail />} />
        <Route path="/patientedit/:patientId" element={<PatientEdit/>} />

        <Route path="/case/:caseId" element={<CaseDetail />} />
        <Route path="/treatmentPlan/:treatmentPlanId" element={<TPDetail />} />
        <Route path="/treatmentPlan/edit/:treatmentPlanId" element={<TPEdit />} />
        <Route path="/TPform" element={<TPForm />} />
  
        <Route path="/referralinfo" element={<ReferralInfo />} />
        <Route path="/referralform" element={<ReferralForm/>} />
        <Route path="/referralinfo/:referralId" element={<ReferralDetails/>} />
        <Route path="/referraledit/:referralId" element={<ReferralEdit/>} />

        <Route path="/contacts" element={<Contacts />} />
        <Route path="/symptoms" element={<Symptoms />} />
        <Route path="/inventory" element={<Inventory />} />


      </Route>
      <Route path="/" element={<Protected />}>
        <Route path="/" element={<Dashboard />} />
      </Route>
      <Route path="/form" element={<Form />} />
      <Route path="/contacts" element={<Contacts />} />
      <Route path="/symptoms" element={<Symptoms />} />
      <Route path="/form" element={<Form />} />
      <Route path="/bar" element={<Bar />} />
      <Route path="/pie" element={<Pie />} />
      <Route path="/line" element={<Line />} />
      <Route path="/calendar" element={<Calendar />} />
    </Route>
  )
);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
