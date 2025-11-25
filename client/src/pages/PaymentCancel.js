import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTimesCircle } from 'react-icons/fa';
import './PaymentResult.css';

const PaymentCancel = () => {
  const navigate = useNavigate();

  return (
    <div className="payment-result">
      <div className="result-card cancel">
        <FaTimesCircle className="result-icon" />
        <h1>Payment Cancelled</h1>
        <p>Your payment was cancelled. No charges have been made to your account.</p>
        <div className="result-info">
          <p>
            If you experienced any issues or have questions, please contact our support
            team.
          </p>
        </div>
        <div className="result-actions">
          <button className="btn btn-primary" onClick={() => navigate('/premium')}>
            Try Again
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/')}>
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancel;
