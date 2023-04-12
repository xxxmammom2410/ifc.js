import React from "react";
import ReactDOM from "react-dom/client";

import { App } from "./App";
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyADxpKB_9UvfbUi3robIE7IjhcpFT8xdts",
  authDomain: "fir-course-31ae9.firebaseapp.com",
  projectId: "fir-course-31ae9",
  storageBucket: "fir-course-31ae9.appspot.com",
  messagingSenderId: "769271477250",
  appId: "1:769271477250:web:1f4fb51e4abfa8126b231b"
};

// Initialize Firebase
initializeApp(firebaseConfig);

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Import the functions you need from the SDKs you need
