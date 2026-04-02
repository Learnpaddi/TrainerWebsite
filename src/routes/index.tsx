import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@shared/firebase/config';
import { isAdmin } from '@shared/firebase/auth';
import Dashboard from '@admin/pages/Dashboard';
import Home from '@student/pages/Home';  // Placeholder
import About from '@student/pages/AboutUs';
import Contact from '@student/pages/Contact';

const AppRoutes = () => {
  const [user, loading] = useAuthState(auth);
  if (loading) return <div>Loading...</div>;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/*" element={
          user && isAdmin(user.email || '') ? <Dashboard /> : <Navigate to="/login" />
        } />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/" element={<Home />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;

