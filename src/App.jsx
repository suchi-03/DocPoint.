import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Login from './pages/Login';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Profile from './pages/Profile';
import DoctorLogin from './DoctorPages/DoctorLogin';
import DoctorList from './DoctorPages/DoctorList';
import UserAppointments from './pages/UserAppointments';
import DoctorDashboard from './DoctorPages/DoctorDashboard';
import DProfile from './DoctorPages/DProfile';


const App = () => {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [isDoctorLoggedIn, setIsDoctorLoggedIn] = useState(!!localStorage.getItem('dtoken'));

  // Update auth state on route change
  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'));
    setIsDoctorLoggedIn(!!localStorage.getItem('dtoken'));
  }, [location]);

  return (
    <div className="mx-10 sm:mx-[10%]">
      <ToastContainer />
      {!isDoctorLoggedIn && (
        <Navbar
          isLoggedIn={isLoggedIn}
          setIsLoggedIn={setIsLoggedIn}
          isDoctorLoggedIn={isDoctorLoggedIn}
        />
      )}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/doctor-login" element={<DoctorLogin setIsDoctorLoggedIn={setIsDoctorLoggedIn} />} />
        <Route path="/doctors" element={<DoctorList />} />
        <Route path="/doctor/:id" element={<DProfile />} />
        <Route path="/appointments" element={<UserAppointments />} />
        <Route path="/doctor/dashboard" element={<DoctorDashboard setIsDoctorLoggedIn={setIsDoctorLoggedIn} />} />
      </Routes>

      {!isDoctorLoggedIn && <Footer />}
    </div>
  );
};

export default App;
