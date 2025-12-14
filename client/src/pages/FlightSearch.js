import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { flightService } from '../services/flightService';
import { toast } from 'react-toastify';
import { FaPlane, FaCalendar, FaUsers, FaSearch, FaUserCircle, FaClock, FaExternalLinkAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';
import { FlightCardSkeleton } from '../components/LoadingSkeleton';
import { getAirlineName, getAirlineBookingUrl, getAirlineLogoUrl, formatDuration } from '../utils/airlineNames';
import './FlightSearch.css';

const FlightSearch = () => {
  const { isAuthenticated } = useAuth();
  
  // Helper function to format time from ISO string
  const formatTime = (isoString) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };
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
  const [searchAnywhere, setSearchAnywhere] = useState(false);
  const [activeTab, setActiveTab] = useState('search');
  const [oneWay, setOneWay] = useState(false);
  const [sortBy, setSortBy] = useState('price');
  const [sortOrder, setSortOrder] = useState('asc');
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
      
      // Handle response structure - response.data might be nested
      const locations = response.data || response || [];
      const airports = (Array.isArray(locations) ? locations : []).filter(loc => 
        loc.subType === 'AIRPORT' || loc.subType === 'CITY'
      ).slice(0, 10);
      
      if (field === 'origin') {
        setOriginSuggestions(airports);
        setShowOriginSuggestions(airports.length > 0);
      } else {
        setDestinationSuggestions(airports);
        setShowDestinationSuggestions(airports.length > 0);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to search airports:', error);
      }
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
      // Reset anywhere mode when user starts typing
      if (searchAnywhere) setSearchAnywhere(false);
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
      setSearchAnywhere(false); // Reset anywhere mode when selecting specific destination
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
      // If visa-free mode is enabled
      if (visaFreeOnly && isAuthenticated) {
        if (!searchParams.origin) {
          toast.warning('Please enter origin airport');
          setLoading(false);
          return;
        }
        
        toast.info('Searching visa-free destinations...', { autoClose: 2000 });
        
        const response = await flightService.getVisaFreeDestinations(searchParams);
        setFlights(response.data);
        setActiveTab('search');
        toast.success(`Found ${response.count} cheapest visa-free destinations for you!`);
      }
      // If "Anywhere" mode is enabled
      else if (searchAnywhere) {
        if (!searchParams.origin) {
          toast.warning('Please enter origin airport');
          setLoading(false);
          return;
        }
        
        // Popular destination airport codes
        const popularDestinations = ['JFK', 'CDG', 'DXB', 'LHR', 'NRT', 'SIN', 'BCN', 'FCO', 'AMS', 'IST'];
        const allFlights = [];
        
        // Search flights to multiple destinations
        for (const dest of popularDestinations) {
          try {
            const response = await flightService.searchFlights({
              ...searchParams,
              destination: dest
            });
            if (response.data && response.data.length > 0) {
              // Take top 2 cheapest from each destination
              const cheapestFlights = response.data
                .sort((a, b) => parseFloat(a.price?.total || 999999) - parseFloat(b.price?.total || 999999))
                .slice(0, 2);
              allFlights.push(...cheapestFlights);
            }
          } catch (err) {
            // Skip destinations that fail
            console.log(`Failed to search ${dest}:`, err.message);
          }
        }
        
        setFlights(allFlights);
        setActiveTab('search');
        toast.success(`Found ${allFlights.length} flights to various destinations`);
      } else {
        const response = await flightService.searchFlights(searchParams);
        setFlights(response.data);
        setActiveTab('search');
        toast.success(`Found ${response.count} flights`);
      }
    } catch (error) {
      toast.error('Failed to search flights. Please try again.');
      if (process.env.NODE_ENV === 'development') {
        console.error(error);
      }
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
      if (process.env.NODE_ENV === 'development') {
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  const saveFlight = async (flight) => {
    try {
      // Check if it's a round trip
      const isRoundTrip = flight.itineraries?.length > 1;
      
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
        provider: 'amadeus',
        // Add complete itinerary information
        itineraries: flight.itineraries?.map(itinerary => ({
          duration: itinerary.duration,
          segments: itinerary.segments?.map(segment => ({
            departure: {
              iataCode: segment.departure?.iataCode,
              at: segment.departure?.at
            },
            arrival: {
              iataCode: segment.arrival?.iataCode,
              at: segment.arrival?.at
            },
            carrierCode: segment.carrierCode,
            number: segment.number,
            aircraft: segment.aircraft?.code,
            numberOfStops: segment.numberOfStops
          }))
        })),
        isRoundTrip
      };
      
      await flightService.saveFlight(flightData);
      toast.success(isRoundTrip ? 'Round-trip flight saved to favorites!' : 'Flight saved to favorites!');
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Save flight error:', error);
      }
      toast.error(error.response?.data?.error || 'Failed to save flight. Please try again.');
    }
  };

  // Parse duration string (e.g., "PT5H30M") to minutes
  const parseDuration = (duration) => {
    if (!duration) return 0;
    const hours = duration.match(/(\ d+)H/);
    const minutes = duration.match(/(\d+)M/);
    return (hours ? parseInt(hours[1]) * 60 : 0) + (minutes ? parseInt(minutes[1]) : 0);
  };

  // Sort flights based on selected criteria
  const getSortedFlights = (flightsList) => {
    if (sortBy === 'none') return flightsList;

    const sorted = [...flightsList].sort((a, b) => {
      if (sortBy === 'price') {
        const priceA = parseFloat(a.price?.total || 0);
        const priceB = parseFloat(b.price?.total || 0);
        return sortOrder === 'asc' ? priceA - priceB : priceB - priceA;
      } else if (sortBy === 'duration') {
        const durationA = parseDuration(a.itineraries?.[0]?.duration);
        const durationB = parseDuration(b.itineraries?.[0]?.duration);
        return sortOrder === 'asc' ? durationA - durationB : durationB - durationA;
      }
      return 0;
    });

    return sorted;
  };

  const handleSortChange = (e) => {
    const value = e.target.value;
    if (value === 'none') {
      setSortBy('none');
    } else {
      const [criteria, order] = value.split('-');
      setSortBy(criteria);
      setSortOrder(order);
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
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          selectAirport(airport, 'origin');
                        }}
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
                  value={visaFreeOnly ? 'Visa-free destinations' : searchAnywhere ? 'Anywhere' : searchParams.destination}
                  onChange={handleChange}
                  onFocus={(e) => {
                    // If "Anywhere" is selected, clear it when user focuses to type
                    if (searchAnywhere) {
                      setSearchAnywhere(false);
                      setSearchParams({ ...searchParams, destination: '' });
                    }
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!visaFreeOnly) {
                      setShowDestinationSuggestions(true);
                    }
                  }}
                  placeholder={visaFreeOnly ? 'Will show visa-free options' : 'City or airport'}
                  required={!visaFreeOnly && !searchAnywhere}
                  autoComplete="off"
                  disabled={visaFreeOnly}
                />
                {showDestinationSuggestions && !visaFreeOnly && (
                  <div className="autocomplete-dropdown" onClick={(e) => e.stopPropagation()}>
                    {/* Anywhere option - always shown first */}
                    <div
                      className="autocomplete-item anywhere-option"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSearchAnywhere(true);
                        setSearchParams({ ...searchParams, destination: 'Anywhere' });
                        setShowDestinationSuggestions(false);
                      }}
                    >
                      <strong>✈️ Anywhere</strong>
                      <br />
                      <small>Search all available destinations from your origin</small>
                    </div>
                    {destinationSuggestions.length > 0 && (
                      <>
                        <div className="dropdown-divider"></div>
                        {destinationSuggestions.map((airport) => (
                          <div
                            key={airport.id}
                            className="autocomplete-item"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              selectAirport(airport, 'destination');
                            }}
                          >
                            <strong>{airport.iataCode}</strong> - {airport.name}
                            <br />
                            <small>{airport.address?.cityName}, {airport.address?.countryName}</small>
                          </div>
                        ))}
                      </>
                    )}
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

              <div className="form-group return-group">
                <label htmlFor="returnDate">Return</label>
                <input
                  type="date"
                  id="returnDate"
                  name="returnDate"
                  value={searchParams.returnDate}
                  onChange={handleChange}
                  min={searchParams.departureDate}
                  disabled={oneWay}
                />
                <label className="oneway-toggle below-toggle">
                  <input
                    type="checkbox"
                    checked={oneWay}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setOneWay(checked);
                      if (checked) {
                        setSearchParams({ ...searchParams, returnDate: '' });
                      }
                    }}
                  />
                  <span>One way</span>
                </label>
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
                      const checked = e.target.checked;
                      setVisaFreeOnly(checked);
                      if (checked) {
                        setSearchParams({ ...searchParams, destination: 'ANYWHERE' });
                        setSearchAnywhere(false);
                      } else {
                        setSearchParams({ ...searchParams, destination: '' });
                      }
                    }}
                  />
                  <span>🌍 My visa-free destinations</span>
                </label>
              )}
              <button type="submit" className="btn btn-primary" disabled={loading}>
                <FaSearch /> {loading ? 'Searching...' : 'Search Flights'}
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="results-tabs">
        <div className="tabs-left">
          <button
            className={`tab ${activeTab === 'search' ? 'active' : ''}`}
            onClick={() => setActiveTab('search')}
          >
            Search Results ({flights.length})
          </button>
          {isAuthenticated && (
            <button
              className={`tab ${activeTab === 'recommendations' ? 'active' : ''}`}
              onClick={() => setActiveTab('recommendations')}
            >
              Recommendations ({recommendations.length})
            </button>
          )}
        </div>
        {isAuthenticated && (
          <button
            type="button"
            className="btn btn-recommendations-tab"
            onClick={loadRecommendations}
            disabled={loading || !searchParams.origin}
            title={!searchParams.origin ? 'Enter origin airport first' : 'Get AI-powered destination recommendations'}
          >
            <span className="btn-icon">✨</span>
            <span className="btn-text">
              <strong>Discover Destinations</strong>
            </span>
          </button>
        )}
      </div>

      {(flights.length > 0 || recommendations.length > 0) && activeTab !== 'recommendations' && (
        <div className="sort-controls">
          <label htmlFor="sortSelect">Sort by:</label>
          <select 
            id="sortSelect"
            value={sortBy === 'none' ? 'none' : `${sortBy}-${sortOrder}`}
            onChange={handleSortChange}
            className="sort-select"
          >
            <option value="price-asc">Price: Low to High (Default)</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="duration-asc">Duration: Shortest First</option>
            <option value="duration-desc">Duration: Longest First</option>
          </select>
        </div>
      )}

      {activeTab === 'search' && (
        <div className="results">
          {loading ? (
            <div className="flights-list">
              {Array(3).fill(0).map((_, index) => (
                <FlightCardSkeleton key={index} />
              ))}
            </div>
          ) : flights.length === 0 ? (
            <p className="no-results">No flights found. Try searching with different criteria.</p>
          ) : (
            <div className="flights-list">
              {getSortedFlights(flights).slice(0, 10).map((flight, index) => {
                const carrierCode = flight.itineraries?.[0]?.segments?.[0]?.carrierCode;
                const airlineName = getAirlineName(carrierCode);
                const bookingUrl = getAirlineBookingUrl(carrierCode);
                
                // Get the actual destination from flight data
                const actualDestination = flight.itineraries?.[0]?.segments?.[flight.itineraries[0]?.segments?.length - 1]?.arrival?.iataCode;
                const destination = (searchAnywhere || visaFreeOnly) ? actualDestination : searchParams.destination;
                
                // Check if it's a round trip (has return flight)
                const isRoundTrip = flight.itineraries?.length > 1;
                const outboundDuration = formatDuration(flight.itineraries?.[0]?.duration);
                const returnDuration = isRoundTrip ? formatDuration(flight.itineraries?.[1]?.duration) : null;
                
                // Get departure and arrival times
                const outboundDeparture = formatTime(flight.itineraries?.[0]?.segments?.[0]?.departure?.at);
                const outboundArrival = formatTime(flight.itineraries?.[0]?.segments?.[flight.itineraries[0]?.segments?.length - 1]?.arrival?.at);
                const returnDeparture = isRoundTrip ? formatTime(flight.itineraries?.[1]?.segments?.[0]?.departure?.at) : null;
                const returnArrival = isRoundTrip ? formatTime(flight.itineraries?.[1]?.segments?.[flight.itineraries[1]?.segments?.length - 1]?.arrival?.at) : null;
                
                return (
                  <div key={index} className="flight-card">
                    <div className="flight-header">
                      <div className="airline-info">
                        <img 
                          src={getAirlineLogoUrl(carrierCode)} 
                          alt={airlineName}
                          className="airline-logo"
                          onError={(e) => e.target.style.display = 'none'}
                        />
                        <div className="airline-details">
                          <h3 className="airline-name">{airlineName}</h3>
                          <span className="airline-code">{carrierCode}</span>
                        </div>
                      </div>
                      <div className="flight-price">
                        <span className="price-label">From</span>
                        <div className="price">{flight.price?.currency} {flight.price?.total}</div>
                      </div>
                    </div>
                    
                    {/* Outbound Flight */}
                    <div className="flight-details styled-timeline">
                      <div className="flight-route-label">OUTBOUND</div>
                      <div className="timeline-row">
                        {flight.itineraries?.[0]?.segments && (
                          <>
                            <div className="timeline-times">
                              <span className="timeline-time">{formatTime(flight.itineraries[0].segments[0].departure.at)}</span>
                              <span className="timeline-airport">{flight.itineraries[0].segments[0].departure.iataCode}</span>
                            </div>
                            <div className="timeline-bar">
                              {flight.itineraries[0].segments.map((segment, idx, arr) => (
                                <React.Fragment key={idx}>
                                  {idx > 0 && (
                                    <div className="timeline-stop">
                                      <div className="timeline-dot" />
                                      <div className="timeline-stop-label">{segment.departure.iataCode}</div>
                                      <div className="timeline-layover">
                                        {(() => {
                                          const prevSegment = arr[idx - 1];
                                          const layoverTime = new Date(segment.departure.at) - new Date(prevSegment.arrival.at);
                                          const layoverHours = Math.floor(layoverTime / (1000 * 60 * 60));
                                          const layoverMinutes = Math.floor((layoverTime % (1000 * 60 * 60)) / (1000 * 60));
                                          return (
                                            <span className="timeline-layover-time">{layoverHours}h {layoverMinutes}m layover</span>
                                          );
                                        })()}
                                      </div>
                                    </div>
                                  )}
                                  {idx < arr.length - 1 && <div className="timeline-line" />}
                                </React.Fragment>
                              ))}
                            </div>
                            <div className="timeline-times">
                              <span className="timeline-time">{formatTime(flight.itineraries[0].segments[flight.itineraries[0].segments.length-1].arrival.at)}</span>
                              <span className="timeline-airport">{flight.itineraries[0].segments[flight.itineraries[0].segments.length-1].arrival.iataCode}</span>
                            </div>
                          </>
                        )}
                      </div>
                      <div className="flight-meta timeline-meta">
                        <span className="meta-item"><FaClock className="meta-icon" /> {outboundDuration || 'Duration not available'}</span>
                        {flight.itineraries?.[0]?.segments && flight.itineraries[0].segments.length > 1 && (
                          <span className="meta-item stops-label">{flight.itineraries[0].segments.length - 1} stop{flight.itineraries[0].segments.length - 1 > 1 ? 's' : ''}</span>
                        )}
                      </div>
                    </div>
                    
                    {/* Return Flight (if exists) */}
                    {isRoundTrip && (
                      <div className="flight-details styled-timeline">
                        <div className="flight-route-label">RETURN</div>
                        <div className="timeline-row">
                          {flight.itineraries?.[1]?.segments && (
                            <>
                              <div className="timeline-times">
                                <span className="timeline-time">{formatTime(flight.itineraries[1].segments[0].departure.at)}</span>
                                <span className="timeline-airport">{flight.itineraries[1].segments[0].departure.iataCode}</span>
                              </div>
                              <div className="timeline-bar">
                                {flight.itineraries[1].segments.map((segment, idx, arr) => (
                                  <React.Fragment key={idx}>
                                    {idx > 0 && (
                                      <div className="timeline-stop">
                                        <div className="timeline-dot" />
                                        <div className="timeline-stop-label">{segment.departure.iataCode}</div>
                                        <div className="timeline-layover">
                                          {(() => {
                                            const prevSegment = arr[idx - 1];
                                            const layoverTime = new Date(segment.departure.at) - new Date(prevSegment.arrival.at);
                                            const layoverHours = Math.floor(layoverTime / (1000 * 60 * 60));
                                            const layoverMinutes = Math.floor((layoverTime % (1000 * 60 * 60)) / (1000 * 60));
                                            return (
                                              <span className="timeline-layover-time">{layoverHours}h {layoverMinutes}m layover</span>
                                            );
                                          })()}
                                        </div>
                                      </div>
                                    )}
                                    {idx < arr.length - 1 && <div className="timeline-line" />}
                                  </React.Fragment>
                                ))}
                              </div>
                              <div className="timeline-times">
                                <span className="timeline-time">{formatTime(flight.itineraries[1].segments[flight.itineraries[1].segments.length-1].arrival.at)}</span>
                                <span className="timeline-airport">{flight.itineraries[1].segments[flight.itineraries[1].segments.length-1].arrival.iataCode}</span>
                              </div>
                            </>
                          )}
                        </div>
                        <div className="flight-meta timeline-meta">
                          <span className="meta-item"><FaClock className="meta-icon" /> {returnDuration || 'Duration not available'}</span>
                          {flight.itineraries?.[1]?.segments && flight.itineraries[1].segments.length > 1 && (
                            <span className="meta-item stops-label">{flight.itineraries[1].segments.length - 1} stop{flight.itineraries[1].segments.length - 1 > 1 ? 's' : ''}</span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="flight-actions">
                      {bookingUrl && (
                        <a 
                          href={bookingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-primary"
                        >
                          Book on {airlineName} <FaExternalLinkAlt />
                        </a>
                      )}
                      <button className="btn btn-secondary" onClick={() => saveFlight(flight)}>
                        Save Flight
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'recommendations' && (
        <div className="results">
          {loading ? (
            <div className="recommendations-grid">
              {Array(6).fill(0).map((_, index) => (
                <div key={index} className="recommendation-card-skeleton">
                  <div className="skeleton-image"></div>
                  <div className="skeleton-content">
                    <div className="skeleton-title"></div>
                    <div className="skeleton-text"></div>
                    <div className="skeleton-text short"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : recommendations.length === 0 ? (
            <div className="no-recommendations">
              <div className="empty-state">
                <span className="empty-icon">🌍</span>
                <h3>No recommendations yet</h3>
                <p>Enter your origin airport and click "Discover Destinations" to get personalized travel recommendations!</p>
              </div>
            </div>
          ) : (
            <div className="recommendations-grid">
              {recommendations.map((rec, index) => (
                <div key={index} className="recommendation-card-modern">
                  <div className="rec-image-container">
                    <img 
                      src={rec.imageUrl} 
                      alt={rec.destination} 
                      className="rec-image"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=600&fit=crop`;
                      }}
                    />
                    <div className="rec-visa-badge">
                      {rec.visaType === 'visa_free' ? 'Visa Free' : rec.visaType}
                    </div>
                  </div>
                  <div className="rec-content">
                    <h3 className="rec-title">{rec.destination}</h3>
                    <p className="rec-description">{rec.description}</p>
                    <button 
                      className="rec-explore-btn"
                      onClick={() => {
                        setSearchParams(prev => ({ ...prev, destination: rec.airport }));
                        setActiveTab('search');
                      }}
                    >
                      <FaPlane /> Search Flights
                    </button>
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
