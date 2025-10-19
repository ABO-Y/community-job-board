// js/firebase-init.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBvTgyi1cgUUCVRZKz8V9tVHlNpfAYnuwk",
  authDomain: "community-job-board-61749.firebaseapp.com",
  projectId: "community-job-board-61749",
  storageBucket: "community-job-board-61749.firebasestorage.app",
  messagingSenderId: "80850241891",
  appId: "1:80850241891:web:384d3c0efc33c9abf02b56",
  measurementId: "G-L878KVWGL4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
let analytics;
try {
  analytics = getAnalytics(app);
} catch (err) {
  // analytics may fail in some environments (file://). Ignore.
  console.warn("Analytics init failed:", err);
}

// Export for other JS files
export const auth = getAuth(app);
export const db = getFirestore(app);


