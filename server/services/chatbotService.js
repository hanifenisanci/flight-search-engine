const axios = require('axios');

// This is a simplified chatbot service
// You can integrate with Dialogflow, OpenAI, or any other chatbot service

class ChatbotService {
  constructor() {
    // We're using OpenAI only - no Dialogflow
  }

  // OpenAI Integration
  async sendToOpenAI(message, conversationHistory = []) {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini',
          store: true,
          metadata: {
            prompt_id: 'pmpt_693d9ea5434c81959745ed3d19f4cf1b082c7cfe84be9c9f'
          },
          messages: [
            {
              role: 'system',
              content: 'You are a helpful travel assistant for a flight search engine. Help users with flight searches, visa requirements, travel recommendations, and general travel questions. Be concise, friendly, and informative.',
            },
            ...conversationHistory,
            {
              role: 'user',
              content: message,
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "chat_response",
              schema: {
                type: "object",
                properties: {
                  message: { type: "string" }
                },
                required: ["message"],
                additionalProperties: false
              }
            }
          },
          max_tokens: 100,
          temperature: 0.7,
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const parsedResponse = JSON.parse(response.data.choices[0].message.content);
      return {
        response: parsedResponse.message,
        model: 'gpt-4o-mini',
      };
    } catch (error) {
      console.error('OpenAI Error:', error.response?.data || error.message);
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
      // Use OpenAI if available
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
