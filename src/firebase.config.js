import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import {getAuth} from 'firebase/auth';
import ApiCalendar from 'react-google-calendar-api';

const firebaseConfig = {
    apiKey: process.env.REACT_APP_API_KEY,
    authDomain: process.env.REACT_APP_AUTH_DOMAIN,
    databaseURL: process.env.REACT_APP_DATABASE_URL,
    projectId: process.env.REACT_APP_PROJECT_ID,
    storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_APP_ID,
  };

  const config = {
    apiKey: process.env.REACT_APP_API_KEY,
    clientId: process.env.REACT_APP_CLIENT_ID,
    scope: 'https://www.googleapis.com/auth/calendar',
    discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
  };
const app = initializeApp(firebaseConfig);
const storage = getStorage(app)
//const storageRef = ref(storage)
const db = getFirestore(app)
const auth = getAuth(app)
const apiCalendar = new ApiCalendar(config);

export {
  storage,
    db,
    auth,
    apiCalendar
}