import React from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/AuthService';
import './UnauthorizedPage.css';

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  const handleBackToLogin = () => {
    authService.logout();
    navigate('/login');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="unauthorized-container">
      <div className="unauthorized-card">
        <h1>403 - Unauthorized Access</h1>
        <p>You do not have permission to view this page.</p>
        <div className="unauthorized-actions">
          <button onClick={handleBackToLogin} className="btn-primary">
            Back to Login
          </button>
          <button onClick={handleGoHome} className="btn-secondary">
            Go to Homepage
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
