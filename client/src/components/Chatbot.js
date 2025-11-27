import React, { useState, useEffect, useRef } from 'react';
import { chatbotService } from '../services/flightService';
import { FaComments, FaTimes, FaPaperPlane } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import './Chatbot.css';

const Chatbot = () => {
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      if (!isAuthenticated) {
        // Show login message for non-authenticated users
        setMessages([
          {
            type: 'bot',
            text: 'Please log in to talk to me!',
            timestamp: new Date(),
          },
        ]);
      } else {
        loadSuggestions();
        // Add welcome message for authenticated users
        setMessages([
          {
            type: 'bot',
            text: 'Hello! I\'m your travel assistant. How can I help you today?',
            timestamp: new Date(),
          },
        ]);
      }
    }
  }, [isOpen, isAuthenticated]);

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
      console.error('Failed to load suggestions:', error);
    }
  };

  const handleSend = async (message = input) => {
    if (!message.trim()) return;
    
    // Check if user is authenticated
    if (!isAuthenticated) {
      return;
    }

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
      const response = await chatbotService.sendMessage(message);
      const botMessage = {
        type: 'bot',
        text: response.data.botResponse,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        type: 'bot',
        text: 'Sorry, I encountered an error. Please try again.',
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
                <div className="message-content">{msg.text}</div>
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

          {!isAuthenticated ? (
            <div className="chatbot-login-prompt">
              <Link to="/login" className="btn btn-primary btn-block">
                Login to Chat
              </Link>
            </div>
          ) : (
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
          )}
        </div>
      )}
    </div>
  );
};

export default Chatbot;
