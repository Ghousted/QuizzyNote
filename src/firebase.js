import { initializeApp } from "firebase/app";
import { getAuth, sendEmailVerification } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Add this import

// Your Firebase configuration object
const firebaseConfig = {
    apiKey: "AIzaSyDMceZAtZbhBY6EHtIMET-N_0SIpo9X1TU",
    authDomain: "quizzynote-production.firebaseapp.com",
    projectId: "quizzynote-production",
    storageBucket: "quizzynote-production.appspot.com",
    messagingSenderId: "877420274755",
    appId: "1:877420274755:web:5ffbb06d3c2cdb9d5d20f6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Authentication instance
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app); // Add this line

// Function to send verification email
export const sendVerificationEmail = async (user) => {
  try {
    await sendEmailVerification(user);
    console.log('Verification email sent!');
  } catch (error) {
    console.error("Error sending verification email:", error.message);
    // Handle error (e.g., display error message to the user)
  }
};

export default app;