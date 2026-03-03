import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

const Login = () => {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const navigate = useNavigate();

  const doLogin = () => {
    if (user && pass) {
      localStorage.setItem('user', user);
      navigate('/dashboard');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      doLogin();
    }
  };

  return (
    <div className="login-page">
      <div className="login-box animate__animated animate__zoomIn">
        <div className="text-center mb-4">
          <div className="d-inline-block p-3 bg-light rounded-4 mb-3">
            <i className="bi bi-shield-lock-fill text-primary fs-2"></i>
          </div>
          <h3 className="fw-bold">FarmTrack Pro</h3>
          <p className="text-muted">Secure Farm Management</p>
        </div>
        <div className="input-group-custom" style={{ marginLeft: '20px' }}>
          <input
            type="text"
            className="modern-input"
            placeholder="Username"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            onKeyPress={handleKeyPress}
            style={{ paddingLeft: '45px' }}
          />
          <i className="bi bi-person"></i>
        </div>
        <div className="input-group-custom" style={{ marginLeft: '20px' }}>
          <input
            type="password"
            className="modern-input"
            placeholder="Password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            onKeyPress={handleKeyPress}
            style={{ paddingLeft: '45px' }}
          />
          <i className="bi bi-key"></i>
        </div>
        <button onClick={doLogin} className="btn-premium w-100">
          Sign In
        </button>
      </div>
    </div>
  );
};

export default Login;
