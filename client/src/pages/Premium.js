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
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to load subscription status:', error);
      }
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
    if (!window.confirm('Are you sure you want to cancel your premium subscription? You will keep premium access until the end of your current billing period.')) {
      return;
    }

    setLoading(true);
    try {
      const response = await paymentService.cancelSubscription();
      toast.success('Subscription cancelled. You will have premium access until ' + new Date(response.cancelAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
      // Reload subscription status to show the cancellation
      const status = await paymentService.getSubscriptionStatus();
      setSubscriptionStatus(status.data);
    } catch (error) {
      toast.error('Failed to cancel subscription');
    } finally {
      setLoading(false);
    }
  };

  const handleReactivateSubscription = async () => {
    setLoading(true);
    try {
      const response = await paymentService.reactivateSubscription();
      toast.success('Subscription reactivated! Your next billing date is ' + new Date(response.nextBillingDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
      // Reload subscription status to show the reactivation
      const status = await paymentService.getSubscriptionStatus();
      setSubscriptionStatus(status.data);
    } catch (error) {
      toast.error('Failed to reactivate subscription');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { name: 'Unlimited AI Chatbot Usage', free: false, premium: true },
    { name: 'Basic Flight Search', free: true, premium: true },
    { name: 'Travel Recommendations', free: true, premium: true },
    { name: 'Visa Requirements Check', free: true, premium: true },
    { name: 'Limited AI Chatbot (10 messages/day)', free: true, premium: false },
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
            
            {subscriptionStatus.cancelAtPeriodEnd && (
              <div className="cancellation-notice">
                <strong>⚠️ Subscription Cancelled</strong>
                <p>Your premium access will continue until {new Date(subscriptionStatus.cancelAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}. You can still enjoy all premium benefits until then.</p>
              </div>
            )}
            
            <div className="info-grid">
              <div className="info-item">
                <strong>Status:</strong>
                <span className={`badge ${subscriptionStatus.cancelAtPeriodEnd ? 'badge-warning' : 'badge-success'}`}>
                  {subscriptionStatus.cancelAtPeriodEnd ? 'Cancelling' : subscriptionStatus.status}
                </span>
              </div>
              <div className="info-item">
                <strong>Plan:</strong>
                <span>Premium - 1000 HUF/month</span>
              </div>
              <div className="info-item">
                <strong>Member Since:</strong>
                <span>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</span>
              </div>
              {subscriptionStatus.currentPeriodEnd && !subscriptionStatus.cancelAtPeriodEnd && (
                <div className="info-item">
                  <strong>Next Billing Date:</strong>
                  <span>{new Date(subscriptionStatus.currentPeriodEnd).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              )}
              {subscriptionStatus.cancelAtPeriodEnd && subscriptionStatus.cancelAt && (
                <div className="info-item">
                  <strong>Premium Until:</strong>
                  <span>{new Date(subscriptionStatus.cancelAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              )}
              {subscriptionStatus.subscriptionStartDate && (
                <div className="info-item">
                  <strong>Subscription Started:</strong>
                  <span>{new Date(subscriptionStatus.subscriptionStartDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              )}
            </div>

            <div className="benefits-section">
              <h3>Your Premium Benefits</h3>
              <ul className="benefits-list">
                <li className="benefit-item">Unlimited AI Chatbot Usage - Chat as much as you want!</li>
              </ul>
            </div>

            {subscriptionStatus.status === 'inactive' ? (
              <button
                className="btn btn-primary mt-3"
                onClick={handleSubscribe}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Restart Subscription'}
              </button>
            ) : subscriptionStatus.cancelAtPeriodEnd ? (
              <button
                className="btn btn-success mt-3"
                onClick={handleReactivateSubscription}
                disabled={loading}
              >
                {loading ? 'Reactivating...' : 'Reactivate Subscription'}
              </button>
            ) : (
              <button
                className="btn btn-danger mt-3"
                onClick={handleCancelSubscription}
                disabled={loading}
              >
                {loading ? 'Cancelling...' : 'Cancel Subscription'}
              </button>
            )}
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
      <div className="premium-content-wrapper">
        <div className="premium-header">
        <FaCrown className="crown-icon" />
        <h1>Upgrade to Premium</h1>
        <p>Unlock advanced features and enhance your travel experience</p>
      </div>

      <div className="pricing-card">
        <div className="price-tag">
          <span className="amount">1000</span>
          <span className="currency">HUF</span>
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
      </div>
      <Footer />
    </div>
  );
};

export default Premium;
