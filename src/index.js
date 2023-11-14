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
import Form from "./pages/form";

import Dashboard from "./pages/dashboard";
import PatientInfo from "./pages/patientInfo";
import Symptoms from "./pages/symptoms";
import Contacts from "./pages/contacts";
import Bar from "./pages/bar";
import Line from "./pages/line";
import Pie from "./pages/pie";
import Calendar from "./pages/calendar";
import PatientGenForm from "./pages/patientgenform";
import PatientDetail from "./pages/patientdetail";

import ReferralInfo from "./pages/referral/referralinfo";
import ReferralForm from './pages/referral/referralform';
import ReferralDetails from './pages/referral/referraldetails';

import TPList from "./pages/treatmentPlan/TPlist";
import TPForm from "./pages/treatmentPlan/TPform";
import TPDetail from "./pages/treatmentPlan/TPdetail";

import InvList from "./pages/inventory/inventoryList";
import InvForm from "./pages/inventory/inventoryForm";


const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/form" element={<Form />} />

      <Route path="/" element={ <Protected /> } >
        <Route path="/" element={ <Dashboard /> } />
        <Route path="/contacts" element={<Contacts />} />
        <Route path="/symptoms" element={<Symptoms />} />
        <Route path="/bar" element={<Bar />} />
        <Route path="/pie" element={<Pie />} />
        <Route path="/line" element={<Line />} />
        <Route path="/calendar" element={<Calendar />} />

        <Route path="/patientInfo" element={<PatientInfo />} />
        <Route path="/patientgenform" element={<PatientGenForm />} />
        <Route path="/patientInfo/:caseNumber" element={<PatientDetail />} />

        <Route path="/referralinfo" element={<ReferralInfo />} />
        <Route path="/referralform" element={<ReferralForm/>} />
        <Route path="/referralinfo/:referralId" element={<ReferralDetails/>} />

        <Route path="/TPlist" element={<TPList />} />
        <Route path="/TPform" element={<TPForm />} />
        <Route path="/TPlist/:caseNumber" element={<TPDetail />} />

        <Route path="/inventoryList" element={<InvList />} />
        <Route path="/inventoryForm" element={<InvForm />} />

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
