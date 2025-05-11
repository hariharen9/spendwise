import React from 'react';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

import '../styles/Footer.css';
import { db } from '../firebaseConfig'; // Assuming firebaseConfig exports db and auth is initialized there or separately
// You might need to initialize auth if not done in firebaseConfig.js
// import { initializeApp } from 'firebase/app';
// const firebaseApp = initializeApp(firebaseConfig); // If firebaseConfig is just the config object
// const auth = getAuth(firebaseApp); // Then initialize auth here

// Styles will be in a new Login.css or integrated into Dashboard.css

const Login = ({ setUser }) => {
  const auth = getAuth(); // Get auth instance
  const provider = new GoogleAuthProvider();

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      // This gives you a Google Access Token. You can use it to access the Google API.
      // const credential = GoogleAuthProvider.credentialFromResult(result);
      // const token = credential.accessToken;
      // The signed-in user info.
      const user = result.user;
      if (setUser) {
        setUser(user); // Pass user object to parent component (App.jsx)
      }
      console.log('User signed in: ', user);
      // You might want to store user profile in Firestore here if not done elsewhere
    } catch (error) {
      // Handle Errors here.
      const errorCode = error.code;
      const errorMessage = error.message;
      // The email of the user's account used.
      // const email = error.customData.email;
      // The AuthCredential type that was used.
      // const credential = GoogleAuthProvider.credentialFromError(error);
      console.error('Google Sign-In Error:', errorCode, errorMessage);
      // Display error to user appropriately
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Welcome to SpendWise!</h2>
        <img src="./Assets/icon-money.svg" alt="SpendWise Logo" />
        <p>Please sign in to continue</p>
        <button onClick={handleGoogleSignIn} className="google-signin-button">
          <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google logo" />
          Sign in with Google
        </button>
        <div className="footer">
        Made with 💖 by <a href="https://www.linkedin.com/in/hariharen9/" target="_blank" rel="noopener noreferrer">Hariharen</a> © 2025
      </div>
      </div>
    </div>
  );
};




export default Login;