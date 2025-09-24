// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDLNQuQecqw62OMoX9G-deZqBszuiIoPM0",
  authDomain: "daelimx-28300.firebaseapp.com",
  projectId: "daelimx-28300",
  storageBucket: "daelimx-28300.appspot.com",
  messagingSenderId: "500062181961",
  appId: "1:500062181961:web:5575034e000c97c88b7d98",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db, onAuthStateChanged };
