import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { paymentService } from '../services/flightService';
import { toast } from 'react-toastify';
import { FaCrown, FaCheck, FaTimes } from 'react-icons/fa';
import Footer from '../components/Footer';
import './Premium.css';

const Premium = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.isPremium) {
      loadSubscriptionStatus();
    }
  }, [user]);

  const loadSubscriptionStatus = async () => {
    try {
      const response = await paymentService.getSubscriptionStatus();
      setSubscriptionStatus(response.data);
    } catch (error) {
      console.error('Failed to load subscription status:', error);
    }
  };

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const response = await paymentService.createSubscription();
      // Redirect to Stripe checkout
      window.location.href = response.url;
    } catch (error) {
      toast.error('Failed to create subscription. Please try again.');
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm('Are you sure you want to cancel your premium subscription?')) {
      return;
    }

    setLoading(true);
    try {
      await paymentService.cancelSubscription();
      updateUser({ ...user, isPremium: false });
      toast.success('Subscription cancelled successfully');
      navigate('/');
    } catch (error) {
      toast.error('Failed to cancel subscription');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { name: 'Advanced Flight Search Filters', free: false, premium: true },
    { name: 'Price Alerts & Notifications', free: false, premium: true },
    { name: 'Unlimited Saved Flights', free: false, premium: true },
    { name: 'Priority Customer Support', free: false, premium: true },
    { name: 'Ad-Free Experience', free: false, premium: true },
    { name: 'Flexible Date Search', free: false, premium: true },
    { name: 'Multi-City Search', free: false, premium: true },
    { name: 'Basic Flight Search', free: true, premium: true },
    { name: 'Travel Recommendations', free: true, premium: true },
    { name: 'Visa Requirements Check', free: true, premium: true },
    { name: 'AI Travel Assistant', free: true, premium: true },
  ];

  if (user?.isPremium) {
    return (
      <div className="premium-page">
        <div className="premium-header premium-active">
          <FaCrown className="crown-icon" />
          <h1>You're a Premium Member!</h1>
          <p>Enjoy all the exclusive benefits</p>
        </div>

        {subscriptionStatus && (
          <div className="subscription-info">
            <h2>Subscription Details</h2>
            <div className="info-grid">
              <div className="info-item">
                <strong>Status:</strong>
                <span className="badge badge-success">{subscriptionStatus.status}</span>
              </div>
              {subscriptionStatus.currentPeriodEnd && (
                <div className="info-item">
                  <strong>Renews:</strong>
                  <span>{new Date(subscriptionStatus.currentPeriodEnd).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            <button
              className="btn btn-danger mt-3"
              onClick={handleCancelSubscription}
              disabled={loading}
            >
              {loading ? 'Cancelling...' : 'Cancel Subscription'}
            </button>
          </div>
        )}

        <div className="features-section">
          <h2>Your Premium Features</h2>
          <div className="features-list">
            {features
              .filter((f) => f.premium)
              .map((feature, index) => (
                <div key={index} className="feature-item active">
                  <FaCheck className="icon-check" />
                  <span>{feature.name}</span>
                </div>
              ))}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="premium-page">
      <div className="premium-header">
        <FaCrown className="crown-icon" />
        <h1>Upgrade to Premium</h1>
        <p>Unlock advanced features and enhance your travel experience</p>
      </div>

      <div className="pricing-card">
        <div className="price-tag">
          <span className="currency">$</span>
          <span className="amount">9.99</span>
          <span className="period">/month</span>
        </div>
        <p className="price-description">Cancel anytime. No hidden fees.</p>
        <button
          className="btn btn-primary btn-large"
          onClick={handleSubscribe}
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Subscribe Now'}
        </button>
      </div>

      <div className="comparison-table">
        <h2>Compare Plans</h2>
        <table>
          <thead>
            <tr>
              <th>Feature</th>
              <th>Free</th>
              <th>Premium</th>
            </tr>
          </thead>
          <tbody>
            {features.map((feature, index) => (
              <tr key={index}>
                <td>{feature.name}</td>
                <td>
                  {feature.free ? (
                    <FaCheck className="icon-check" />
                  ) : (
                    <FaTimes className="icon-times" />
                  )}
                </td>
                <td>
                  {feature.premium ? (
                    <FaCheck className="icon-check" />
                  ) : (
                    <FaTimes className="icon-times" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Footer />
    </div>
  );
};

export default Premium;
