import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import Chatbot from '../components/Chatbot';
import Footer from '../components/Footer';
import { blogArticles } from './Blog';
import './Home.css';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const travelGuides = [
    {
      title: 'Top 10 Visa-Free Destinations for Turkish Citizens in 2025',
      description: 'Discover the best countries you can visit without a visa as a Turkish passport holder. Explore new cultures hassle-free.',
      image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&h=400&fit=crop'
    },
    {
      title: 'How to Apply for a Schengen Visa: Complete Guide',
      description: 'Planning a European adventure? Learn everything you need to know about the application process, documents, and tips.',
      image: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=600&h=400&fit=crop'
    },
    {
      title: 'Best Times to Book Flights: Insider Tips to Save Money',
      description: 'Learn the secrets of flight booking timing. Discover when to buy tickets for the best prices and save big.',
      image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&h=400&fit=crop'
    },
    {
      title: 'Digital Nomad Guide: Countries with Extended Visa Options',
      description: 'Working remotely? Explore countries offering special digital nomad visas and stay longer in paradise.',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop'
    }
  ];

  const popularDestinations = [
    { name: 'Tokyo, Japan', city: 'Tokyo', country: 'Japan', description: 'Experience the vibrant culture and modern marvels of Tokyo.', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&h=400&fit=crop' },
    { name: 'Paris, France', city: 'Paris', country: 'France', description: 'Discover the romantic allure and iconic landmarks of Paris.', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&h=400&fit=crop' },
    { name: 'Cancun, Mexico', city: 'Cancun', country: 'Mexico', description: 'Relax on the beautiful beaches and explore the rich history of Cancun.', image: 'https://images.unsplash.com/photo-1569003339405-ea396a5a8a90?w=600&h=400&fit=crop' },
    { name: 'London, UK', city: 'London', country: 'UK', description: 'Immerse yourself in the historical grandeur and cultural diversity of London.', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&h=400&fit=crop' },
    { name: 'Rome, Italy', city: 'Rome', country: 'Italy', description: 'Explore the ancient wonders and artistic treasures of Rome.', image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600&h=400&fit=crop' },
    { name: 'Barcelona, Spain', city: 'Barcelona', country: 'Spain', description: 'Enjoy the vibrant nightlife and architectural wonders of Barcelona.', image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=600&h=400&fit=crop' }
  ];

  const handleDestinationClick = (destination) => {
    toast.info(`Please enter your origin airport to search flights to ${destination.city}`, {
      position: 'top-center',
      autoClose: 4000
    });
    navigate('/search', { state: { destination: destination.city } });
  };

  const travelTips = [
    {
      icon: '✈️',
      title: 'Plan Ahead',
      description: 'Research visa requirements and travel advisories for your destination well in advance to avoid last-minute surprises.'
    },
    {
      icon: '💰',
      title: 'Budget Wisely',
      description: 'Create a realistic budget for your trip, including accommodation, food, and activities. Always have an emergency fund.'
    },
    {
      icon: '🧳',
      title: 'Pack Smart',
      description: 'Pack light and efficiently, considering the climate and activities at your destination. Don\'t forget travel essentials.'
    }
  ];

  return (
    <div className="home-dark">
      <div className="home-content-wrapper">
        {/* Hero Section */}
        <div className="hero-section-new">
          <div className="hero-background">
            <img 
              src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600&h=900&fit=crop" 
              alt="Travel" 
              className="hero-bg-image"
            />
            <div className="hero-overlay"></div>
          </div>
          <div className="hero-content-new">
            <h1>Discover Visa-Free Destinations</h1>
            <p>Explore a world of possibilities with your passport. Find destinations that welcome you without a visa and start your journey today.</p>
            <div className="hero-buttons-new">
              <Link to="/search" className="btn-primary-new">
                <span className="btn-icon">✈️</span> Explore Flights
              </Link>
            </div>
          </div>
        </div>

        {/* Travel Guides Section */}
        <section className="section-container">
          <div className="section-header">
            <div>
              <h2 className="section-title-new">Latest Travel Guides</h2>
              <p className="section-subtitle">Curated advice for modern travelers</p>
            </div>
            <Link to="/blog" className="see-more-link-new">
              See More <span className="arrow">→</span>
            </Link>
          </div>
          <div className="guides-grid">
            {travelGuides.map((guide, index) => (
              <Link 
                key={index} 
                to="/blog"
                className="guide-card"
              >
                <div className="guide-image-wrapper">
                  <img src={guide.image} alt={guide.title} className="guide-image" />
                  <div className="guide-overlay"></div>
                </div>
                <div className="guide-content">
                  <h3>{guide.title}</h3>
                  <p>{guide.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Popular Destinations Section */}
        <section className="section-container">
          <div className="section-header">
            <div>
              <h2 className="section-title-new">Popular Destinations</h2>
              <p className="section-subtitle">Trending locations loved by our community</p>
            </div>
          </div>
          <div className="destinations-grid-new">
            {popularDestinations.map((dest, index) => (
              <div 
                key={index} 
                className="destination-card-new"
                onClick={() => handleDestinationClick(dest)}
                style={{ cursor: 'pointer' }}
              >
                <div className="destination-image-wrapper">
                  <img src={dest.image} alt={dest.name} className="destination-image-new" />
                  <div className="destination-gradient"></div>
                </div>
                <div className="destination-info-new">
                  <h3>{dest.name}</h3>
                  <p>{dest.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Travel Tips Section */}
        <section className="section-container">
          <div className="section-header-center">
            <h2 className="section-title-new">Travel Tips</h2>
            <p className="section-subtitle">Essential advice to ensure your journey is smooth and memorable</p>
          </div>
          <div className="tips-grid-new">
            {travelTips.map((tip, index) => (
              <div key={index} className="tip-card-new">
                <div className="tip-icon-wrapper">
                  <span className="tip-emoji">{tip.icon}</span>
                </div>
                <h3>{tip.title}</h3>
                <p>{tip.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <h2>Ready to Explore?</h2>
          <p>Join thousands of travelers discovering new places every day.</p>
          <Link to="/search" className="cta-button">
            Start Your Adventure
          </Link>
        </section>
      </div>
      <Footer />
      <Chatbot />
    </div>
  );
};

export default Home;
