import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Chatbot from '../components/Chatbot';
import Footer from '../components/Footer';
import './Home.css';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [nationality, setNationality] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    // Anyone can search flights, login just personalizes recommendations
    navigate('/search');
  };

  const featuredDestinations = [
    {
      title: 'Paradise Found: Island Getaways',
      description: 'Unwind on pristine beaches with no visa hassles.',
      image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=500&fit=crop'
    },
    {
      title: 'European Charm: Visa-Free Cities',
      description: 'Explore historic sites and vibrant cultures without visa restrictions.',
      image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&h=500&fit=crop'
    },
    {
      title: 'Mountain Escapes: Adventure Awaits',
      description: 'Experience breathtaking views and outdoor activities visa-free.',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=500&fit=crop'
    }
  ];

  const popularDestinations = [
    { name: 'Tokyo, Japan', description: 'Experience the vibrant culture and modern marvels of Tokyo.', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop' },
    { name: 'Paris, France', description: 'Discover the romantic allure and iconic landmarks of Paris.', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&h=300&fit=crop' },
    { name: 'Cancun, Mexico', description: 'Relax on the beautiful beaches and explore the rich history of Cancun.', image: 'https://images.unsplash.com/photo-1518337856365-c4a6ebe7c7c0?w=400&h=300&fit=crop' },
    { name: 'London, UK', description: 'Immerse yourself in the historical grandeur and cultural diversity of London.', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&h=300&fit=crop' },
    { name: 'Rome, Italy', description: 'Explore the ancient wonders and artistic treasures of Rome.', image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400&h=300&fit=crop' },
    { name: 'Barcelona, Spain', description: 'Enjoy the vibrant nightlife and architectural wonders of Barcelona.', image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400&h=300&fit=crop' }
  ];

  return (
    <div className="home-dark">
      <div className="hero-section">
        <div className="hero-background">
          <div className="hero-text">
            <h1>Discover Visa-Free Destinations</h1>
            <p>Explore a world of possibilities with your passport. Find destinations that welcome you without a visa.</p>
          </div>
          <div className="hero-search">
            <Link to="/search" className="explore-flights-btn">
              Explore Flights
            </Link>
          </div>
        </div>
      </div>

      <h2 className="section-title">Featured Destinations</h2>
      <div className="featured-scroll">
        {featuredDestinations.map((dest, index) => (
          <div key={index} className="featured-card">
            <div className="featured-image" style={{ backgroundImage: `url(${dest.image})` }}></div>
            <div className="featured-info">
              <p className="featured-title">{dest.title}</p>
              <p className="featured-desc">{dest.description}</p>
            </div>
          </div>
        ))}
      </div>

      <h2 className="section-title">Popular Destinations</h2>
      <div className="destinations-grid">
        {popularDestinations.map((dest, index) => (
          <div key={index} className="destination-card">
            <div className="destination-image" style={{ backgroundImage: `url(${dest.image})` }}></div>
            <div className="destination-info">
              <p className="destination-name">{dest.name}</p>
              <p className="destination-desc">{dest.description}</p>
            </div>
          </div>
        ))}
      </div>

      <h2 className="section-title">Travel Tips</h2>
      <div className="tips-grid">
        <div className="tip-card">
          <svg className="tip-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
            <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm88,104a87.62,87.62,0,0,1-6.4,32.94l-44.7-27.49a15.92,15.92,0,0,0-6.24-2.23l-22.82-3.08a16.11,16.11,0,0,0-16,7.86h-8.72l-3.8-7.86a15.91,15.91,0,0,0-11-8.67l-8-1.73L96.14,104h16.71a16.06,16.06,0,0,0,7.73-2l12.25-6.76a16.62,16.62,0,0,0,3-2.14l26.91-24.34A15.93,15.93,0,0,0,166,49.1l-.36-.65A88.11,88.11,0,0,1,216,128ZM143.31,41.34,152,56.9,125.09,81.24,112.85,88H96.14a16,16,0,0,0-13.88,8l-8.73,15.23L63.38,84.19,74.32,58.32a87.87,87.87,0,0,1,69-17ZM40,128a87.53,87.53,0,0,1,8.54-37.8l11.34,30.27a16,16,0,0,0,11.62,10l21.43,4.61L96.74,143a16.09,16.09,0,0,0,14.4,9h1.48l-7.23,16.23a16,16,0,0,0,2.86,17.37l.14.14L128,205.94l-1.94,10A88.11,88.11,0,0,1,40,128Zm102.58,86.78,1.13-5.81a16.09,16.09,0,0,0-4-13.9,1.85,1.85,0,0,1-.14-.14L120,174.74,133.7,144l22.82,3.08,45.72,28.12A88.18,88.18,0,0,1,142.58,214.78Z"></path>
          </svg>
          <h3>Plan Ahead</h3>
          <p>Research visa requirements and travel advisories for your destination.</p>
        </div>
        <div className="tip-card">
          <svg className="tip-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
            <path d="M152,120H136V56h8a32,32,0,0,1,32,32,8,8,0,0,0,16,0,48.05,48.05,0,0,0-48-48h-8V24a8,8,0,0,0-16,0V40h-8a48,48,0,0,0,0,96h8v64H104a32,32,0,0,1-32-32,8,8,0,0,0-16,0,48.05,48.05,0,0,0,48,48h16v16a8,8,0,0,0,16,0V216h16a48,48,0,0,0,0-96Zm-40,0a32,32,0,0,1,0-64h8v64Zm40,80H136V136h16a32,32,0,0,1,0,64Z"></path>
          </svg>
          <h3>Budget Wisely</h3>
          <p>Create a realistic budget for your trip, including accommodation, food, and activities.</p>
        </div>
        <div className="tip-card">
          <svg className="tip-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
            <path d="M216,56H176V48a24,24,0,0,0-24-24H104A24,24,0,0,0,80,48v8H40A16,16,0,0,0,24,72V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V72A16,16,0,0,0,216,56ZM96,48a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm64,24V200H96V72ZM40,72H80V200H40ZM216,200H176V72h40V200Z"></path>
          </svg>
          <h3>Pack Smart</h3>
          <p>Pack light and efficiently, considering the climate and activities at your destination.</p>
        </div>
      </div>

      <div className="cta-section">
        <h1>Ready to Explore?</h1>
        <Link to="/search" className="cta-button">Start Your Adventure</Link>
      </div>

      {isAuthenticated && <Chatbot />}
      <Footer />
    </div>
  );
};

export default Home;
