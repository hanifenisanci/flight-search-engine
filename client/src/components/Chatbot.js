import React, { useState, useEffect, useRef } from 'react';
import { chatbotService } from '../services/flightService';
import { FaComments, FaTimes, FaPaperPlane } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import './Chatbot.css';

const Chatbot = () => {
  const { isAuthenticated, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [messageCount, setMessageCount] = useState(0);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      loadSuggestions();
      // Add welcome message
      const firstName = user?.name ? user.name.split(' ')[0] : null;
      const welcomeText = isAuthenticated && firstName
        ? `Hello ${firstName}! I'm your travel assistant. How can I help you today?` 
        : 'Hello! I\'m your travel assistant. How can I help you today?';
      
      setMessages([
        {
          type: 'bot',
          text: welcomeText,
          timestamp: new Date(),
        },
      ]);
    }
  }, [isOpen, isAuthenticated, user?.name]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadSuggestions = async () => {
    try {
      const response = await chatbotService.getSuggestions();
      setSuggestions(response.data);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to load suggestions:', error);
      }
    }
  };

  const handleSend = async (message = input) => {
    if (!message.trim()) return;

    // Add user message
    const userMessage = {
      type: 'user',
      text: message,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const firstName = user?.name ? user.name.split(' ')[0] : null;
      const response = await chatbotService.sendMessage(message, {
        name: firstName,
        citizenship: user?.citizenship
      });
      setMessageCount(prev => prev + 1);
      const botMessage = {
        type: 'bot',
        text: response.data.botResponse,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      let errorText = error.response?.data?.error || 'Sorry, I encountered an error. Please try again.';
      
      // Add helpful links for rate limit errors
      if (error.response?.status === 429) {
        const isPremium = user?.isPremium;
        if (!isAuthenticated) {
          const botMessage = {
            type: 'bot',
            text: (
              <span>
                You've used your 3 free messages! Please <Link to="/login" style={{color: '#6c63ff', textDecoration: 'underline', fontWeight: 'bold'}}>log in</Link> to get 5 more messages, or <Link to="/premium" style={{color: '#6c63ff', textDecoration: 'underline', fontWeight: 'bold'}}>upgrade to premium</Link> for unlimited access.
              </span>
            ),
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, botMessage]);
          setLoading(false);
          return;
        } else if (!isPremium) {
          errorText = (
            <span>
              You've reached your limit! <Link to="/premium" style={{color: '#6c63ff', textDecoration: 'underline', fontWeight: 'bold'}}>Upgrade to premium</Link> for unlimited chatbot access.
            </span>
          );
        }
      }
      
      const errorMessage = {
        type: 'bot',
        text: errorText,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    handleSend(suggestion);
  };

  const handleToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleCloseClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(false);
  };

  // Format message text to render bold text (**text**)
  const formatMessage = (text) => {
    if (typeof text !== 'string') return text;
    
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div style={{ position: 'fixed', zIndex: 9999 }}>
      {/* Chat Toggle Button */}
      <button
        type="button"
        className="chatbot-toggle"
        onClick={handleToggle}
        aria-label="Toggle chatbot"
      >
        {isOpen ? <FaTimes /> : <FaComments />}
      </button>

      {/* Chatbot Window */}
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <h3>Travel Assistant</h3>
            <button type="button" onClick={handleCloseClick} className="close-btn">
              <FaTimes />
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.type}`}>
                <div className="message-content">{formatMessage(msg.text)}</div>
                <div className="message-time">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            ))}
            {loading && (
              <div className="message bot">
                <div className="message-content typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {isAuthenticated && suggestions.length > 0 && messages.length <= 1 && (
            <div className="chatbot-suggestions">
              {suggestions.map((suggestion, index) => (
                <button
                  type="button"
                  key={index}
                  className="suggestion-btn"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          <div className="chatbot-input">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your message..."
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="send-btn"
            >
              <FaPaperPlane />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
