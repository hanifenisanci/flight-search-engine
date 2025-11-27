import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { flightService } from '../services/flightService';
import { toast } from 'react-toastify';
import { FaPlane, FaCalendar, FaUsers, FaSearch, FaUserCircle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';
import './FlightSearch.css';

const FlightSearch = () => {
  const { isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useState({
    origin: '',
    destination: '',
    departureDate: '',
    returnDate: '',
    adults: 1,
    travelClass: 'ECONOMY',
  });
  const [flights, setFlights] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [visaFreeOnly, setVisaFreeOnly] = useState(false);
  const [activeTab, setActiveTab] = useState('search');
  const [originSuggestions, setOriginSuggestions] = useState([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const originTimeoutRef = useRef(null);
  const destinationTimeoutRef = useRef(null);

  const searchAirports = async (keyword, field) => {
    if (keyword.length < 2) {
      if (field === 'origin') setOriginSuggestions([]);
      else setDestinationSuggestions([]);
      return;
    }

    setLoadingSuggestions(true);
    try {
      const response = await flightService.searchLocations(keyword);
      console.log('Location search response:', response);
      
      // Handle response structure - response.data might be nested
      const locations = response.data || response || [];
      const airports = (Array.isArray(locations) ? locations : []).filter(loc => 
        loc.subType === 'AIRPORT' || loc.subType === 'CITY'
      ).slice(0, 10);
      
      console.log('Filtered airports:', airports);
      
      if (field === 'origin') {
        setOriginSuggestions(airports);
        setShowOriginSuggestions(airports.length > 0);
      } else {
        setDestinationSuggestions(airports);
        setShowDestinationSuggestions(airports.length > 0);
      }
    } catch (error) {
      console.error('Failed to search airports:', error);
      if (field === 'origin') {
        setOriginSuggestions([]);
        setShowOriginSuggestions(false);
      } else {
        setDestinationSuggestions([]);
        setShowDestinationSuggestions(false);
      }
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchParams({
      ...searchParams,
      [name]: value,
    });

    // Trigger airport search with debouncing
    if (name === 'origin') {
      if (originTimeoutRef.current) clearTimeout(originTimeoutRef.current);
      originTimeoutRef.current = setTimeout(() => {
        searchAirports(value, 'origin');
      }, 300);
    } else if (name === 'destination') {
      if (destinationTimeoutRef.current) clearTimeout(destinationTimeoutRef.current);
      destinationTimeoutRef.current = setTimeout(() => {
        searchAirports(value, 'destination');
      }, 300);
    }
  };

  const selectAirport = (airport, field) => {
    setSearchParams({
      ...searchParams,
      [field]: airport.iataCode,
    });
    if (field === 'origin') {
      setShowOriginSuggestions(false);
      setOriginSuggestions([]);
    } else {
      setShowDestinationSuggestions(false);
      setDestinationSuggestions([]);
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowOriginSuggestions(false);
      setShowDestinationSuggestions(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await flightService.searchFlights(searchParams);
      setFlights(response.data);
      toast.success(`Found ${response.count} flights`);
    } catch (error) {
      toast.error('Failed to search flights. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecommendations = async () => {
    if (!searchParams.origin) {
      toast.warning('Please enter origin airport to get recommendations');
      return;
    }

    setLoading(true);
    try {
      const response = await flightService.getRecommendations(searchParams.origin);
      setRecommendations(response.data);
      setActiveTab('recommendations');
      toast.success('Recommendations loaded!');
    } catch (error) {
      toast.error('Failed to load recommendations');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const saveFlight = async (flight) => {
    try {
      // Structure the flight data for saving
      const flightData = {
        origin: searchParams.origin,
        destination: searchParams.destination,
        departureDate: searchParams.departureDate,
        returnDate: searchParams.returnDate || null,
        airline: flight.itineraries?.[0]?.segments?.[0]?.carrierCode || 'Unknown',
        flightNumber: flight.itineraries?.[0]?.segments?.[0]?.number || 'N/A',
        price: {
          amount: parseFloat(flight.price?.total || 0),
          currency: flight.price?.currency || 'USD'
        },
        duration: flight.itineraries?.[0]?.duration || 'N/A',
        stops: flight.itineraries?.[0]?.segments?.[0]?.numberOfStops || 0,
        class: searchParams.travelClass?.toLowerCase() || 'economy',
        availableSeats: flight.numberOfBookableSeats || null,
        externalId: flight.id,
        provider: 'amadeus'
      };
      
      await flightService.saveFlight(flightData);
      toast.success('Flight saved to favorites!');
    } catch (error) {
      console.error('Save flight error:', error);
      toast.error(error.response?.data?.error || 'Failed to save flight. Please try again.');
    }
  };

  return (
    <div className="flight-search">
      <div className="flight-search-content">
        {!isAuthenticated && (
        <div className="personalization-banner">
          <div className="banner-icon">
            <FaUserCircle />
          </div>
          <div className="banner-content">
            <h3>Get Personalized Recommendations</h3>
            <p>Log in to receive flight recommendations tailored to your citizenship and visa status</p>
          </div>
          <Link to="/login" className="banner-btn">Log In</Link>
        </div>
      )}

      <div className="search-header">
        <h1>Flights to Anywhere</h1>
        <p>Explore destinations offering visa-free travel for your passport.</p>
      </div>

      <div className="search-card">
        <form onSubmit={handleSearch}>
          <div className="search-form">
            <div className="form-row">
              <div className="form-group autocomplete-wrapper">
                <label htmlFor="origin">
                  From
                </label>
                <div className="input-icon">
                  <FaSearch />
                </div>
                <input
                  type="text"
                  id="origin"
                  name="origin"
                  value={searchParams.origin}
                  onChange={handleChange}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (originSuggestions.length > 0) setShowOriginSuggestions(true);
                  }}
                  placeholder="City or airport"
                  required
                  autoComplete="off"
                />
                {showOriginSuggestions && originSuggestions.length > 0 && (
                  <div className="autocomplete-dropdown" onClick={(e) => e.stopPropagation()}>
                    {originSuggestions.map((airport) => (
                      <div
                        key={airport.id}
                        className="autocomplete-item"
                        onClick={() => selectAirport(airport, 'origin')}
                      >
                        <strong>{airport.iataCode}</strong> - {airport.name}
                        <br />
                        <small>{airport.address?.cityName}, {airport.address?.countryName}</small>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-group autocomplete-wrapper">
                <label htmlFor="destination">
                  To
                </label>
                <div className="input-icon">
                  <FaSearch />
                </div>
                <input
                  type="text"
                  id="destination"
                  name="destination"
                  value={visaFreeOnly ? 'Visa-free destinations' : searchParams.destination}
                  onChange={handleChange}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (destinationSuggestions.length > 0) setShowDestinationSuggestions(true);
                  }}
                  placeholder={visaFreeOnly ? 'Will show visa-free options' : 'City or airport'}
                  required={!visaFreeOnly}
                  autoComplete="off"
                  disabled={visaFreeOnly}
                />
                {showDestinationSuggestions && destinationSuggestions.length > 0 && (
                  <div className="autocomplete-dropdown" onClick={(e) => e.stopPropagation()}>
                    {destinationSuggestions.map((airport) => (
                      <div
                        key={airport.id}
                        className="autocomplete-item"
                        onClick={() => selectAirport(airport, 'destination')}
                      >
                        <strong>{airport.iataCode}</strong> - {airport.name}
                        <br />
                        <small>{airport.address?.cityName}, {airport.address?.countryName}</small>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="form-row triple-row">
              <div className="form-group">
                <label htmlFor="departureDate">
                  Departure
                </label>
                <input
                  type="date"
                  id="departureDate"
                  name="departureDate"
                  value={searchParams.departureDate}
                  onChange={handleChange}
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="form-group">
                <label htmlFor="returnDate">
                  Return
                </label>
                <input
                  type="date"
                  id="returnDate"
                  name="returnDate"
                  value={searchParams.returnDate}
                  onChange={handleChange}
                  min={searchParams.departureDate}
                />
              </div>

              <div className="form-group">
                <label htmlFor="adults">
                  Travelers
                </label>
                <input
                  type="number"
                  id="adults"
                  name="adults"
                  value={searchParams.adults}
                  onChange={handleChange}
                  min="1"
                  max="9"
                  placeholder="1 traveler"
                />
              </div>
            </div>

            <div className="search-buttons">
              {isAuthenticated && (
                <label className="checkbox-label-inline">
                  <input
                    type="checkbox"
                    checked={visaFreeOnly}
                    onChange={(e) => {
                      setVisaFreeOnly(e.target.checked);
                      if (e.target.checked) {
                        setSearchParams({ ...searchParams, destination: '' });
                      }
                    }}
                  />
                  <span>My visa-free options</span>
                </label>
              )}
              <button type="submit" className="btn btn-primary" disabled={loading}>
                <FaSearch /> {loading ? 'Searching...' : 'Search Flights'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={loadRecommendations}
                disabled={loading}
              >
                Get Recommendations
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="results-tabs">
        <button
          className={`tab ${activeTab === 'search' ? 'active' : ''}`}
          onClick={() => setActiveTab('search')}
        >
          Search Results ({flights.length})
        </button>
        <button
          className={`tab ${activeTab === 'recommendations' ? 'active' : ''}`}
          onClick={() => setActiveTab('recommendations')}
        >
          Recommendations ({recommendations.length})
        </button>
      </div>

      {activeTab === 'search' && (
        <div className="results">
          {flights.length === 0 ? (
            <p className="no-results">No flights found. Try searching with different criteria.</p>
          ) : (
            <div className="flights-list">
              {flights.slice(0, 10).map((flight, index) => (
                <div key={index} className="flight-card">
                  <div className="flight-info">
                    <h3>{flight.itineraries?.[0]?.segments?.[0]?.carrierCode || 'Airline'}</h3>
                    <p>
                      {searchParams.origin} → {searchParams.destination}
                    </p>
                    <p className="flight-duration">
                      Duration: {flight.itineraries?.[0]?.duration || 'N/A'}
                    </p>
                  </div>
                  <div className="flight-price">
                    <div className="price">
                      {flight.price?.currency} {flight.price?.total}
                    </div>
                    <button className="btn btn-primary btn-sm" onClick={() => saveFlight(flight)}>
                      Save Flight
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'recommendations' && (
        <div className="results">
          {recommendations.length === 0 ? (
            <p className="no-results">No recommendations yet. Click "Get Recommendations" above.</p>
          ) : (
            <div className="recommendations-list">
              {recommendations.map((rec, index) => (
                <div key={index} className="recommendation-card">
                  <h3>{rec.destination.country}</h3>
                  <div className="rec-details">
                    <span className={`visa-badge ${rec.visaRequired ? 'required' : 'free'}`}>
                      {rec.visaRequired ? 'Visa Required' : 'Visa Free'}
                    </span>
                    {rec.visaType && <span className="visa-type">{rec.visaType}</span>}
                  </div>
                  <p className="rec-reason">{rec.reason}</p>
                  <div className="rec-score">
                    <div className="score-bar">
                      <div className="score-fill" style={{ width: `${rec.score}%` }}></div>
                    </div>
                    <span>{rec.score}% Match</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      </div>
      <Footer />
    </div>
  );
};

export default FlightSearch;
