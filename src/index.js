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

import Symptoms from "./pages/symptoms";
import Contacts from "./pages/contacts";

import Calendar from "./pages/calendar";

import PatientInfo from "./pages/patientinfo/patientInfo";
import PatientGenForm from "./pages/patientinfo/patientgenform";
import PatientDetail from "./pages/patientinfo/patientdetail";
import PatientEdit from "./pages/patientinfo/patientedit";

import ReferralInfo from "./pages/referral/referralinfo";
import ReferralForm from './pages/referral/referralform';
import ReferralDetails from './pages/referral/referraldetails';
import ReferralEdit from "./pages/referral/referraledit";

import Inventory from "./pages/inventory";
import TPList from "./pages/treatmentPlan/TPlist";
import TPForm from "./pages/treatmentPlan/TPform";
import TPDetail from "./pages/treatmentPlan/TPdetail";
import TPEdit from "./pages/treatmentPlan/TPedit";

import { Form } from "react-router-dom";
import Patient_Info from "./pages/patientinfo/patientInfo";
import { Bar, Pie, Line } from "react-chartjs-2";


import Case_Detail from "./pages/case_detail";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />

      <Route path="/" element={ <Protected /> } >
        <Route path="/" element={ <Dashboard /> } />
        <Route path="/userlist" element={< UserList/>} />
        <Route path="/calendar" element={<Calendar />} />

        <Route path="/patientInfo" element={<PatientInfo />} />
        <Route path="/patientgenform" element={<PatientGenForm />} />
        <Route path="/patientInfo/:caseNumber" element={<PatientDetail />} />
        <Route path="/patientedit/:patientId" element={<PatientEdit/>} />
          
        <Route path="/referralinfo" element={<ReferralInfo />} />
        <Route path="/referralform" element={<ReferralForm/>} />
        <Route path="/referralinfo/:referralId" element={<ReferralDetails/>} />
        <Route path="/referraledit/:referralId" element={<ReferralEdit/>} />

        <Route path="/contacts" element={<Contacts />} />
        <Route path="/symptoms" element={<Symptoms />} />
        <Route path="/inventory" element={<Inventory />} />

        <Route path="/TPlist" element={<TPList />} />
        <Route path="/TPform" element={<TPForm />} />
        <Route path="/TPlist/:caseNumber" element={<TPDetail />} />
        <Route path="/TPedit/:treatmentId" element={<TPEdit/>} />

      </Route>
      <Route path="/" element={<Protected />}>
        <Route path="/" element={<Dashboard />} />
      </Route>
      <Route path="/form" element={<Form />} />
      <Route path="/patient_info" element={<Patient_Info />} />
      <Route
        path="/patient_info/:caseNumber/case/:caseNumber" // Define route with dynamic parameters
        element={<Case_Detail />}
      />
      <Route path="/contacts" element={<Contacts />} />
      <Route path="/symptoms" element={<Symptoms />} />
      <Route path="/form" element={<Form />} />
      <Route path="/bar" element={<Bar />} />
      <Route path="/pie" element={<Pie />} />
      <Route path="/line" element={<Line />} />
      <Route path="/calendar" element={<Calendar />} />
      <Route path="/patientgenform" element={<PatientGenForm />} />
      <Route path="/patient_info/:caseNumber" element={<PatientDetail />} />
    </Route>
  )
);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
