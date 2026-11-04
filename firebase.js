import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCLATZYl_5GOyf4rtkAC-vma6u0jrs4qPg",
  authDomain: "mk-portfolio-6aaf0.firebaseapp.com",
  projectId: "mk-portfolio-6aaf0",
  storageBucket: "mk-portfolio-6aaf0.firebasestorage.app",
  messagingSenderId: "413887547596",
  appId: "1:413887547596:web:37aedfe8770588872f9a69"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);