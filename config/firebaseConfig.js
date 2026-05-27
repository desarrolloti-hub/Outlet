// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD-SR-t4CcwHwblmHr8P-2xU6L2KHkdbW4",
  authDomain: "otril-mx.firebaseapp.com",
  projectId: "otril-mx",
  storageBucket: "otril-mx.firebasestorage.app",
  messagingSenderId: "37416439692",
  appId: "1:37416439692:web:9f431322dcd03800d1d0a9",
  measurementId: "G-YQEE57QYDW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);