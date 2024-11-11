import React, { useState } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate} from 'react-router-dom';
import { Link } from 'react-router-dom';
function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard'); 
    } catch (error) {
      console.error("Error signing in:", error.message);
      // Handle errors with specific messages 
      let errorMessage = 'An error occurred during sign-in. Please try again.';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No user found with this email.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } 
      alert(errorMessage);
    }
  };

  const handleForgotPassword = async () => {
    try {
      await sendPasswordResetEmail(auth, email);
      alert('Password reset email sent!');
    } catch (error) {
      console.error("Error sending password reset email:", error.message);
      // ... handle errors specifically... 
      let errorMessage = 'An error occurred. Please try again later.';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No user found with this email.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      }
      alert(errorMessage);
    }
  };

  return (
    <div 
      style={{ 
        backgroundColor: '#fad0c4', 
        minHeight: '100vh', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center' 
      }}
    >
      <form 
        onSubmit={handleSubmit} 
        style={{ 
          backgroundColor: 'white', 
          padding: '30px', 
          borderRadius: '8px',
          textAlign: 'center', 
          width: '350px'
        }}
      >
        <h2 style={{ color: '#0084ff' }}>Sign In</h2>

        {/* Email Input */}
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ 
              width: '100%', 
              padding: '10px', 
              margin: '10px 0', 
              borderRadius: '5px', 
              border: '1px solid #ddd' 
            }}
          />
        </div>

        {/* Password Input */}
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ 
              width: '100%', 
              padding: '10px', 
              margin: '10px 0', 
              borderRadius: '5px', 
              border: '1px solid #ddd' 
            }}
          />
        </div>

        <button 
          type="submit" 
          style={{ 
            backgroundColor: '#0084ff', 
            color: 'white', 
            padding: '10px 20px', 
            border: 'none', 
            borderRadius: '5px', 
            cursor: 'pointer',
            marginTop: '10px' 
          }}
        >
          Sign In
        </button>

        {/* Forgot Password */}
        <div style={{ textAlign: 'center', marginTop: '10px' }}>
          <button 
            type="button" 
            onClick={handleForgotPassword} 
            style={{ 
              border: 'none', 
              background: 'none', 
              color: '#0084ff', 
              cursor: 'pointer' 
            }}
          >
            Forgot Password?
          </button>
        </div>

        {/* Create Account Link */}
        <div style={{ textAlign: 'center', marginTop: '20px' }}> 
          <p>Don't have an account?</p>
          <Link to="/signup" style={{ color: '#0084ff', textDecoration: 'none' }}>
            Create an account
          </Link>
        </div>
      </form>
    </div>
  );
}

export default SignIn;