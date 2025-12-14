const chatbotService = require('../services/chatbotService');
const { v4: uuidv4 } = require('uuid');

// Store conversation sessions in memory (use Redis in production)
const conversationSessions = new Map();
const conversationHistories = new Map();

// @desc    Send message to chatbot
// @route   POST /api/chatbot/message
// @access  Public (but with tiered rate limits)
exports.sendMessage = async (req, res) => {
  try {
    const { message, userInfo } = req.body;
    const userId = req.user?.id || req.ip; // Use IP for guests

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a message',
      });
    }

    // Get user information from authenticated user or from request
    const fullName = req.user?.name || userInfo?.name;
    const userName = fullName ? fullName.split(' ')[0] : null;
    const userCitizenship = req.user?.citizenship || userInfo?.citizenship;

    // Get or create session
    let sessionId = conversationSessions.get(userId);
    if (!sessionId) {
      sessionId = uuidv4();
      conversationSessions.set(userId, sessionId);
    }

    // Get or create conversation history
    let history = conversationHistories.get(sessionId) || [];
    
    console.log('📝 Session ID:', sessionId);
    console.log('📚 Current history length:', history.length);
    console.log('💬 New message:', message);

    // Process message through chatbot service
    const response = await chatbotService.processMessage(
      message,
      sessionId,
      history,
      {
        name: userName,
        citizenship: userCitizenship
      }
    );

    // Update conversation history (keep last 10 exchanges)
    // Only add messages with valid content
    if (message && message.trim()) {
      history.push({ role: 'user', content: message });
    }
    if (response.response && response.response.trim()) {
      history.push({ role: 'assistant', content: response.response });
    }
    
    if (history.length > 20) {
      history = history.slice(-20); // Keep last 20 messages (10 exchanges)
    }
    conversationHistories.set(sessionId, history);
    
    console.log('✅ Updated history length:', history.length);

    res.json({
      success: true,
      data: {
        userMessage: message,
        botResponse: response.response,
        intent: response.intent || null,
        confidence: response.confidence || null,
        timestamp: new Date(),
        isGuest: !req.user,
        isPremium: req.user?.isPremium || false,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Get chatbot suggestions
// @route   GET /api/chatbot/suggestions
// @access  Private
exports.getSuggestions = async (req, res) => {
  try {
    const suggestions = [
      'Search for flights to Paris',
      'What visa do I need for Japan?',
      'Show me travel recommendations',
      'Tell me about premium membership',
      'Check visa requirements for USA',
    ];

    res.json({
      success: true,
      data: suggestions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Clear conversation history
// @route   DELETE /api/chatbot/session
// @access  Public
exports.clearSession = async (req, res) => {
  try {
    const userId = req.user?.id || req.ip;
    const sessionId = conversationSessions.get(userId);
    
    if (sessionId) {
      conversationHistories.delete(sessionId);
    }
    conversationSessions.delete(userId);

    res.json({
      success: true,
      message: 'Conversation session cleared',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
