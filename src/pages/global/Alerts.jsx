import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase.config';
import { List, ListItem, ListItemText, Dialog, DialogTitle, DialogContent } from "@mui/material";


const Alerts = ({ alertDialogOpen, handleAlertsClose }) => {
  const [alerts, setAlerts] = useState([]);
  const { caseNumber } = useParams();

  useEffect(() => {
    let unsubscribeAlerts;
  
    const fetchData = async () => {
      if (!caseNumber) {
        console.log('No caseNumber provided');
        return;
      }

      const alertsQuery = query(
        collection(db, 'alerts'),
        where('caseNumber', '==', caseNumber)
      );
  
      unsubscribeAlerts = onSnapshot(
        alertsQuery,
        (snapshot) => {
          const fetchedAlerts = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setAlerts(fetchedAlerts);
        },
        (error) => {
          console.error("Error fetching alerts: ", error);
        }
      );
    };

    fetchData(); // Call fetchData to execute the data fetching

    return () => {
      if (unsubscribeAlerts) {
        unsubscribeAlerts(); // This will cancel the subscription on cleanup
      }
    };
  }, [caseNumber]); 
  
  return (
    <Dialog onClose={handleAlertsClose} open={alertDialogOpen}>
      <DialogTitle>Notifications</DialogTitle>
      <DialogContent dividers>
        <List>
          {alerts.map((alert) => (
            <ListItem key={alert.id} divider>
              <ListItemText primary={alert.title} secondary={alert.message} />
            </ListItem>
          ))}
          {alerts.length === 0 && (
            <ListItem>
              <ListItemText primary="No alerts to show." />
            </ListItem>
          )}
        </List>
      </DialogContent>
    </Dialog>
  );
};

export default Alerts;
