import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Route,
} from "react-router-dom";
import Protected from './components/Protected';
import Login from "./pages/auth/login";
import Signup from "./pages/auth/signup";

import Dashboard from "./pages/dashboard";

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




const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />

      <Route path="/" element={ <Protected /> } >
        <Route path="/" element={ <Dashboard /> } />
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

      </Route>
    </Route>
  )
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
