import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import StudentRegister from './pages/StudentRegister';
import Quiz from './pages/Quiz';
import Result from './pages/Result';
import FacultyDashboard from './pages/FacultyDashboard';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/student/register" element={<StudentRegister />} />
        <Route path="/student/quiz" element={<Quiz />} />
        <Route path="/student/result" element={<Result />} />
        <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
