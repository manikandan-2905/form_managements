import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Components/Login';
import Dashboard from './Components/Dashboard';
import Logs from './Components/Logs';
import './App.css';
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/logs" element={<Logs />} />
      </Routes>
    </Router>
  );
}

export default App;
