import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import SignUp from './Auth/SignUp';
import SignIn from './Auth/SignIn';
import Dashboard from './components/Dashboard'; 
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase'; // Make sure you have your Firebase setup

function App() {
  const [user] = useAuthState(auth);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />

        <Route element={<ProtectedLayout user={user} />}>
          <Route path="/dashboard/*" element={<Dashboard />} /> 
        </Route>

        {/* Redirect to /dashboard/home after sign-in */}
        <Route path="/" element={user ? <Navigate to="/dashboard/home" /> : <Navigate to="/signin" />} /> 
      </Routes>
    </BrowserRouter>
  );
}

// Protected Layout Component 
function ProtectedLayout({ user }) {
  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  return (
    <div>
      <Outlet /> 
    </div>
  );
}

export default App;