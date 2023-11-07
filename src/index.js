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
import Patient_Info from "./pages/patient_info";
import Symptoms from "./pages/symptoms";
import Contacts from "./pages/contacts";
import Bar from "./pages/bar";
import Line from "./pages/line";
import Pie from "./pages/pie";
import Calendar from "./pages/calendar";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/" element={ <Protected /> } >
        <Route path="/" element={ <Dashboard /> } />
      </Route>
        <Route path="/form" element={<Form />} />
        <Route path="/patient_info" element={<Patient_Info />} />
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

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <RouterProvider router={router} />
);

