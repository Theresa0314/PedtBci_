import React, { useState, createContext, useContext } from 'react';

export const PatientInfoContext = createContext();

export const PatientInfoProvider = ({ children }) => {
  const [patientInfoId, setPatientInfoId] = useState('');
  
  return (
    <PatientInfoContext.Provider value={{ patientInfoId, setPatientInfoId }}>
      {children}
    </PatientInfoContext.Provider>
  );
};

export const usePatientInfo = () => useContext(PatientInfoContext);
