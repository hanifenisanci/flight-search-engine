import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { paymentService } from '../services/flightService';
import { FaCheckCircle } from 'react-icons/fa';
import './PaymentResult.css';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const { updateUser, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      verifyPayment(sessionId);
    } else {
      setVerifying(false);
    }
  }, [searchParams]);

  const verifyPayment = async (sessionId) => {
    try {
      const response = await paymentService.verifySubscription(sessionId);
      updateUser(response.data);
      setVerifying(false);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Payment verification failed:', error);
      }
      setVerifying(false);
    }
  };

  if (verifying) {
    return (
      <div className="payment-result">
        <div className="result-card">
          <div className="spinner"></div>
          <h2>Verifying Payment...</h2>
          <p>Please wait while we confirm your subscription.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-result">
      <div className="result-card success">
        <FaCheckCircle className="result-icon" />
        <h1>Payment Successful!</h1>
        <p>Welcome to Premium! Your subscription is now active.</p>
        <div className="result-benefits">
          <h3>You now have access to:</h3>
          <ul>
            <li>Advanced flight search filters</li>
            <li>Price alerts and notifications</li>
            <li>Unlimited saved flights</li>
            <li>Priority customer support</li>
            <li>Ad-free experience</li>
          </ul>
        </div>
        <div className="result-actions">
          <button className="btn btn-primary" onClick={() => navigate('/search')}>
            Start Searching Flights
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/profile')}>
            View Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
