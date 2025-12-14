import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService, flightService } from '../services/flightService';
import { toast } from 'react-toastify';
import { FaUser, FaPassport, FaPlus, FaTrash, FaPlane, FaClock, FaMoneyBillWave } from 'react-icons/fa';
import Footer from '../components/Footer';
import { TableSkeleton } from '../components/LoadingSkeleton';
import './Profile.css';

// Common countries list
const countries = [
  { code: 'US', name: 'United States' },
  { code: 'TR', name: 'Turkey' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'JP', name: 'Japan' },
  { code: 'CN', name: 'China' },
  { code: 'IN', name: 'India' },
  { code: 'BR', name: 'Brazil' },
  { code: 'MX', name: 'Mexico' },
  { code: 'RU', name: 'Russia' },
  { code: 'KR', name: 'South Korea' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'SE', name: 'Sweden' },
  { code: 'NO', name: 'Norway' },
  { code: 'DK', name: 'Denmark' },
  { code: 'FI', name: 'Finland' },
  { code: 'BE', name: 'Belgium' },
  { code: 'AT', name: 'Austria' },
  { code: 'GR', name: 'Greece' },
  { code: 'PT', name: 'Portugal' },
  { code: 'PL', name: 'Poland' },
  { code: 'CZ', name: 'Czech Republic' },
  { code: 'HU', name: 'Hungary' },
  { code: 'IE', name: 'Ireland' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'SG', name: 'Singapore' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'TH', name: 'Thailand' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'EG', name: 'Egypt' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'AR', name: 'Argentina' },
  { code: 'CL', name: 'Chile' },
  { code: 'CO', name: 'Colombia' },
];

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: user?.name || '',
    citizenship: user?.citizenship || '',
    passportNumber: '',
    dateOfBirth: '',
  });
  const [visas, setVisas] = useState([]);
  const [newVisa, setNewVisa] = useState({
    country: '',
    visaType: 'Tourist',
    validUntil: '',
    issueDate: new Date().toISOString().split('T')[0],
  });
  const [showVisaForm, setShowVisaForm] = useState(false);
  const [savedFlights, setSavedFlights] = useState([]);
  const [loadingFlights, setLoadingFlights] = useState(false);

  useEffect(() => {
    loadProfile();
    loadSavedFlights();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await userService.getProfile();
      const userData = response.data;
      setProfile({
        name: userData.name,
        citizenship: userData.citizenship,
        passportNumber: userData.passportNumber || '',
        dateOfBirth: userData.dateOfBirth ? userData.dateOfBirth.split('T')[0] : '',
      });
      setVisas(userData.visas || []);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to load profile:', error);
      }
      // Don't show error toast if it's just a loading issue
      if (error.response?.status !== 401) {
        toast.error('Failed to load profile');
      }
    }
  };

  const loadSavedFlights = async () => {
    setLoadingFlights(true);
    try {
      const response = await flightService.getSavedFlights();
      setSavedFlights(response.data || []);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to load saved flights:', error);
      }
    } finally {
      setLoadingFlights(false);
    }
  };

  const handleProfileChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveProfile = async () => {
    try {
      const response = await userService.updateProfile(profile);
      updateUser(response.data);
      setEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleVisaChange = (e) => {
    setNewVisa({
      ...newVisa,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddVisa = async (e) => {
    e.preventDefault();
    try {
      const response = await userService.addVisa(newVisa);
      setVisas(response.data.visas);
      setNewVisa({ country: '', visaType: 'Tourist', validUntil: '', issueDate: new Date().toISOString().split('T')[0] });
      setShowVisaForm(false);
      toast.success('Visa added successfully!');
    } catch (error) {
      toast.error('Failed to add visa');
    }
  };

  const handleRemoveVisa = async (visaId) => {
    try {
      const response = await userService.removeVisa(visaId);
      setVisas(response.data.visas);
      toast.success('Visa removed successfully!');
    } catch (error) {
      toast.error('Failed to remove visa');
    }
  };

  const handleRemoveFlight = async (flightId) => {
    try {
      const updatedFlights = savedFlights.filter(flight => flight._id !== flightId);
      setSavedFlights(updatedFlights);
      toast.success('Flight removed from favorites!');
    } catch (error) {
      toast.error('Failed to remove flight');
      loadSavedFlights();
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-content">
        <h1>My Profile</h1>

        <div className="profile-section">
        <div className="section-header">
          <h2>
            <FaUser /> Personal Information
          </h2>
          {!editing && (
            <button className="btn btn-secondary" onClick={() => setEditing(true)}>
              Edit Profile
            </button>
          )}
        </div>

        <div className="profile-card">
          {editing ? (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={profile.name}
                    onChange={handleProfileChange}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    style={{ opacity: 0.7, cursor: 'not-allowed' }}
                  />
                </div>
              </div>

              <div className="form-row" style={{ gridTemplateColumns: '1fr' }}>
                <div className="form-group">
                  <label>Nationality</label>
                  <select
                    name="citizenship"
                    value={profile.citizenship}
                    onChange={handleProfileChange}
                    required
                  >
                    <option value="">Select your country</option>
                    {countries.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="profile-actions">
                <button className="btn btn-secondary" onClick={() => setEditing(false)}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleSaveProfile}>
                  Save Changes
                </button>
              </div>
            </>
          ) : (
            <div className="profile-info">
              <div className="info-item">
                <strong>Full Name</strong>
                <span>{profile.name}</span>
              </div>
              <div className="info-item">
                <strong>Email Address</strong>
                <span>{user?.email}</span>
              </div>
              <div className="info-item">
                <strong>Nationality</strong>
                <span>{countries.find(c => c.code === profile.citizenship)?.name || profile.citizenship}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="profile-section">
        <div className="section-header">
          <h2>
            <FaPassport /> My Visas
          </h2>
          <button className="btn btn-primary" onClick={() => setShowVisaForm(!showVisaForm)}>
            <FaPlus /> Add Visa
          </button>
        </div>

        {showVisaForm && (
          <div className="visa-form">
            <form onSubmit={handleAddVisa}>
              <div className="form-row">
                <div className="form-group">
                  <label>Country</label>
                  <select
                    name="country"
                    value={newVisa.country}
                    onChange={handleVisaChange}
                    required
                  >
                    <option value="">Select country</option>
                    {countries.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Expiration Date</label>
                  <input
                    type="date"
                    name="validUntil"
                    value={newVisa.validUntil}
                    onChange={handleVisaChange}
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowVisaForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Visa
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="visas-list">
          {visas.length === 0 ? (
            <p className="no-items">No visas added yet. Add your visas to get better travel recommendations!</p>
          ) : (
            visas.map((visa) => (
              <div key={visa._id} className="visa-card">
                <div className="visa-info">
                  <h3>{countries.find(c => c.code === visa.country)?.name || visa.country}</h3>
                  <p>Expires: {new Date(visa.validUntil).toLocaleDateString()}</p>
                </div>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleRemoveVisa(visa._id)}
                  title="Delete visa"
                >
                  <FaTrash />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="profile-section">
        <div className="section-header">
          <h2>
            <FaPlane /> Saved Flights
          </h2>
          {savedFlights.length > 0 && (
            <span className="badge">{savedFlights.length}</span>
          )}
        </div>

        <div className="saved-flights-list">
          {loadingFlights ? (
            <TableSkeleton rows={3} columns={3} />
          ) : savedFlights.length === 0 ? (
            <p className="no-items">
              No saved flights yet. Search for flights and save your favorites to see them here!
            </p>
          ) : (
            <div className="flights-grid">
              {savedFlights.map((flight) => (
                <div key={flight._id} className="saved-flight-card">
                  <div className="flight-route">
                    <div className="route-info">
                      <span className="airport-code">{flight.origin}</span>
                      <FaPlane className="route-icon" />
                      <span className="airport-code">{flight.destination}</span>
                    </div>
                    <div className="flight-airline">
                      {flight.airline} {flight.flightNumber}
                    </div>
                  </div>

                  <div className="flight-details">
                    <div className="detail-item">
                      <FaClock className="detail-icon" />
                      <div>
                        <small>Departure</small>
                        <div>{new Date(flight.departureDate).toLocaleDateString()}</div>
                      </div>
                    </div>
                    
                    {flight.returnDate && (
                      <div className="detail-item">
                        <FaClock className="detail-icon" />
                        <div>
                          <small>Return</small>
                          <div>{new Date(flight.returnDate).toLocaleDateString()}</div>
                        </div>
                      </div>
                    )}

                    <div className="detail-item">
                      <FaMoneyBillWave className="detail-icon" />
                      <div>
                        <small>Price</small>
                        <div className="flight-price">
                          {flight.price?.currency} {flight.price?.amount}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flight-meta">
                    <span className="flight-duration">
                      Duration: {flight.duration}
                    </span>
                    <span className="flight-class">
                      {flight.class?.toUpperCase()}
                    </span>
                    {flight.stops > 0 && (
                      <span className="flight-stops">
                        {flight.stops} stop{flight.stops > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  <button
                    className="btn btn-danger btn-sm remove-flight-btn"
                    onClick={() => handleRemoveFlight(flight._id)}
                    title="Remove from favorites"
                  >
                    <FaTrash /> Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;
