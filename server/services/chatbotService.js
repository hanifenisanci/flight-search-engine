const axios = require('axios');

// This is a simplified chatbot service
// You can integrate with Dialogflow, OpenAI, or any other chatbot service

// Option 1: Dialogflow Integration
const dialogflow = require('@google-cloud/dialogflow');

class ChatbotService {
  constructor() {
    // Initialize Dialogflow client if credentials are available
    if (process.env.DIALOGFLOW_PROJECT_ID && process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      this.sessionClient = new dialogflow.SessionsClient();
      this.projectId = process.env.DIALOGFLOW_PROJECT_ID;
    }
  }

  // Send message to Dialogflow
  async sendToDialogflow(message, sessionId) {
    try {
      const sessionPath = this.sessionClient.projectAgentSessionPath(
        this.projectId,
        sessionId
      );

      const request = {
        session: sessionPath,
        queryInput: {
          text: {
            text: message,
            languageCode: 'en-US',
          },
        },
      };

      const responses = await this.sessionClient.detectIntent(request);
      const result = responses[0].queryResult;

      return {
        response: result.fulfillmentText,
        intent: result.intent.displayName,
        confidence: result.intentDetectionConfidence,
      };
    } catch (error) {
      console.error('Dialogflow Error:', error);
      throw error;
    }
  }

  // Option 2: OpenAI Integration (Alternative)
  async sendToOpenAI(message, conversationHistory = []) {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful travel assistant for a flight search engine. Help users with flight searches, visa requirements, travel recommendations, and general travel questions.',
            },
            ...conversationHistory,
            {
              role: 'user',
              content: message,
            },
          ],
          max_tokens: 150,
          temperature: 0.7,
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        response: response.data.choices[0].message.content,
        model: 'gpt-3.5-turbo',
      };
    } catch (error) {
      console.error('OpenAI Error:', error);
      throw error;
    }
  }

  // Simple rule-based chatbot (fallback if no external service is configured)
  async getSimpleResponse(message) {
    const lowerMessage = message.toLowerCase();

    // Flight search queries
    if (lowerMessage.includes('flight') || lowerMessage.includes('search')) {
      return {
        response: 'I can help you search for flights! Please use the flight search feature on the main page. You can filter by origin, destination, dates, and more. What destination are you interested in?',
      };
    }

    // Visa queries
    if (lowerMessage.includes('visa')) {
      return {
        response: 'I can help with visa information! Based on your citizenship, I can check visa requirements for any destination. Go to your profile to manage your visa information, or use the visa checker in the flight search.',
      };
    }

    // Premium membership
    if (lowerMessage.includes('premium') || lowerMessage.includes('subscription')) {
      return {
        response: 'Premium membership gives you access to advanced search filters, price alerts, priority support, and personalized travel recommendations. Would you like to upgrade to premium?',
      };
    }

    // Recommendations
    if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest')) {
      return {
        response: 'I can provide personalized travel recommendations based on your citizenship and visa status! Check the recommendations section for destinations where you can travel easily.',
      };
    }

    // Greeting
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return {
        response: 'Hello! Welcome to the Flight Search Engine. How can I assist you today? I can help with flight searches, visa information, travel recommendations, and premium membership.',
      };
    }

    // Default response
    return {
      response: 'I\'m here to help with flight searches, visa requirements, and travel planning. Could you please provide more details about what you\'re looking for?',
    };
  }

  // Main method to process messages
  async processMessage(message, sessionId, conversationHistory = []) {
    try {
      // Try Dialogflow first
      if (this.sessionClient) {
        return await this.sendToDialogflow(message, sessionId);
      }

      // Try OpenAI if available
      if (process.env.OPENAI_API_KEY) {
        return await this.sendToOpenAI(message, conversationHistory);
      }

      // Fallback to simple responses
      return await this.getSimpleResponse(message);
    } catch (error) {
      console.error('Chatbot Error:', error);
      return await this.getSimpleResponse(message);
    }
  }
}

module.exports = new ChatbotService();
