import React, { useState, useEffect } from 'react';
import { FaSearch, FaCalendar, FaExternalLinkAlt } from 'react-icons/fa';
import Footer from '../components/Footer';
import './News.css';

const News = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredArticles, setFilteredArticles] = useState([]);

  const MEDIASTACK_API_KEY = '499b151336dd5f6693be3b228027889b';
  const CATEGORIES = ['visa', 'schengen', 'travel', 'backpacking', 'erasmus'];

  useEffect(() => {
    fetchNews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredArticles(articles);
    } else {
      const filtered = articles.filter(article =>
        article.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredArticles(filtered);
    }
  }, [searchQuery, articles]);

  const fetchNews = async () => {
    setLoading(true);
    try {
      // Fetch general news with keywords
      const keywords = CATEGORIES.join(',');
      const response = await fetch(
        `http://api.mediastack.com/v1/news?access_key=${MEDIASTACK_API_KEY}&keywords=${keywords}&languages=en&limit=100`
      );
      
      const data = await response.json();
      console.log('API Response:', data);
      
      if (data.data && data.data.length > 0) {
        setArticles(data.data);
        setFilteredArticles(data.data);
      } else {
        console.log('No articles found in API response');
      }
    } catch (error) {
      console.error('Failed to fetch news:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="news-page">
      <div className="news-content-wrapper">
        <div className="news-container">
          <div className="news-header">
          <h1>Travel News & Visa Updates</h1>
          <div className="search-bar">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search articles or countries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="news-content">
          {loading ? (
            <div className="loading">Loading articles...</div>
          ) : filteredArticles.length === 0 ? (
            <div className="no-results">No articles found</div>
          ) : (
            <div className="articles-grid">
              {/* Featured Article */}
              {filteredArticles[0] && (
                <div className="featured-article">
                  {filteredArticles[0].image && (
                    <img src={filteredArticles[0].image} alt={filteredArticles[0].title} />
                  )}
                  <div className="featured-content">
                    <span className="featured-badge">FEATURED ARTICLE</span>
                    <h2>{filteredArticles[0].title}</h2>
                    <p>{filteredArticles[0].description}</p>
                    <div className="article-meta">
                      <span className="date">
                        <FaCalendar /> {formatDate(filteredArticles[0].published_at)}
                      </span>
                      {filteredArticles[0].url && (
                        <a 
                          href={filteredArticles[0].url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="read-more"
                        >
                          Read Full Article <FaExternalLinkAlt />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Regular Articles */}
              <div className="articles-list">
                {filteredArticles.slice(1).map((article, index) => (
                  <div key={index} className="article-card">
                    {article.image && (
                      <img src={article.image} alt={article.title} className="article-image" />
                    )}
                    <div className="article-content">
                      <span className="article-category">
                        {article.category || 'VISA UPDATE'}
                      </span>
                      <h3>{article.title}</h3>
                      <p>{article.description?.substring(0, 150)}...</p>
                      <div className="article-footer">
                        <span className="date">
                          <FaCalendar /> {formatDate(article.published_at)}
                        </span>
                        {article.url && (
                          <a 
                            href={article.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="read-link"
                          >
                            Read More <FaExternalLinkAlt />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
      <Footer />
    </div>
  );
};

export default News;
