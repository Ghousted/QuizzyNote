import React, { useState, useEffect } from "react";
import { NavLink, Outlet, Route, Routes, useLocation } from "react-router-dom";
import "./Dashboard.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faBook, faClipboardList, faQuestionCircle, faAngleLeft, faAngleRight, faLightbulb, faSignOutAlt } from '@fortawesome/free-solid-svg-icons'; 
import Home from './Home'; 
import Notes from './Notes'; 
import Flashcards from './Flashcards'; 
import Quizzes from './Quizzes'; 
import { auth } from '../firebase'; // Import the auth object

function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); 
  const location = useLocation();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
    auth.signOut()
      .then(() => {
        // Redirect to the sign-in page after logout
        window.location.href = '/signin'; 
      })
      .catch((error) => {
        console.error("Error signing out:", error);
      });
  };

  useEffect(() => {
    const homeLink = document.querySelector('.sidebar a[href="/dashboard/home"]'); 
    if (location.pathname === '/dashboard/home' && homeLink) {
      homeLink.classList.add('active');
    } else if (homeLink) {
      homeLink.classList.remove('active');
    }
  }, [location.pathname]);

  return (
    <div className="dashboard-container">
      <div className={`sidebar ${isSidebarOpen ? '' : 'closed'}`}>
        <div className="sidebar-header"> 
          <FontAwesomeIcon icon={faLightbulb} className="logo-icon" /> 
          <span className="app-name">QuizzyNote</span>
        </div>

        <button onClick={toggleSidebar} className="sidebar-toggle-button">
          <FontAwesomeIcon icon={isSidebarOpen ? faAngleLeft : faAngleRight} />
        </button>

        <ul>
          <li>
            <NavLink to="/dashboard/home" activeclassname="active"> 
              <FontAwesomeIcon icon={faHome} /> <span>Home</span> 
            </NavLink>
          </li>
           <li>
            <NavLink to="/dashboard/notes" activeclassname="active">
              <FontAwesomeIcon icon={faBook} /> <span>My Notes</span> 
            </NavLink>
          </li>
          <li>
            <NavLink to="/dashboard/flashcards" activeclassname="active">
              <FontAwesomeIcon icon={faClipboardList} /> <span>My Flashcards</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/dashboard/quizzes" activeclassname="active">
              <FontAwesomeIcon icon={faQuestionCircle} /> <span>My Quizzes</span> 
            </NavLink>
          </li>
        </ul>

        {/* Logout button at the bottom of the sidebar */}
        <button onClick={handleLogout} className="sidebar-button" style={{marginBottom: '20px'}}>
          <FontAwesomeIcon icon={faSignOutAlt} /> 
          <span>Logout</span>
        </button>
      </div>

      <main className="content-area">
        <Routes> 
          <Route path="*" element= {<Home />}/> 
          <Route path="notes" element={<Notes />} /> 
          <Route path="flashcards" element={<Flashcards />} />
          <Route path="quizzes" element={<Quizzes />} />
        </Routes>
          <Outlet /> 
      </main>
    </div>
        );
      }
          
          export default Dashboard;