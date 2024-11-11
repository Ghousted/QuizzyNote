import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, sendVerificationEmail } from '../firebase'; 
import { useNavigate, Link } from 'react-router-dom';

function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (password.length < 6) {
        alert('Password must be at least 6 characters long.');
        return; 
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await sendVerificationEmail(user); 

      setShowSuccess(true);
      setTimeout(() => {
        navigate('/signin'); 
      }, 2000);
    } catch (error) {
      console.error("Error signing up:", error.message);
      // Handle errors with user-friendly messages
      let errorMessage = 'An error occurred. Please try again later.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already in use.';
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
        <h2 style={{ color: '#0084ff' }}>Sign Up</h2>

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
          Sign Up
        </button>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <p>Already have an account?</p>
          <Link to="/signin" style={{ color: '#0084ff', textDecoration: 'none' }}>
            Sign in
          </Link>
        </div>

        {showSuccess && (
          <div style={{ color: 'green', marginTop: '10px' }}>
            Account created successfully! You'll be redirected shortly...
          </div>
        )}

      </form>
    </div>
  );
}

export default SignUp;