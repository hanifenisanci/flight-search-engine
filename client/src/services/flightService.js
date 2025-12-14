import api from './api';

export const flightService = {
  searchFlights: async (searchParams) => {
    const response = await api.get('/flights/search', { params: searchParams });
    return response.data;
  },

  getRecommendations: async (origin) => {
    const response = await api.get('/flights/recommendations', {
      params: { origin },
    });
    return response.data;
  },

  saveFlight: async (flightData) => {
    const response = await api.post('/flights/save', flightData);
    return response.data;
  },

  checkVisaRequirement: async (destination) => {
    const response = await api.get('/flights/visa-check', {
      params: { destination },
    });
    return response.data;
  },

  searchLocations: async (keyword) => {
    const response = await api.get('/flights/locations', {
      params: { keyword },
    });
    return response.data;
  },

  getVisaFreeDestinations: async (searchParams) => {
    const response = await api.get('/flights/visa-free-destinations', { 
      params: searchParams 
    });
    return response.data;
  },

  getSavedFlights: async () => {
    const response = await api.get('/users/saved-flights');
    return response.data;
  },
};

export const userService = {
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  updateProfile: async (userData) => {
    const response = await api.put('/users/profile', userData);
    return response.data;
  },

  addVisa: async (visaData) => {
    const response = await api.post('/users/visa', visaData);
    return response.data;
  },

  removeVisa: async (visaId) => {
    const response = await api.delete(`/users/visa/${visaId}`);
    return response.data;
  },
};

export const paymentService = {
  createSubscription: async () => {
    const response = await api.post('/payments/create-subscription');
    return response.data;
  },

  verifySubscription: async (sessionId) => {
    const response = await api.post('/payments/verify-subscription', {
      sessionId,
    });
    return response.data;
  },

  cancelSubscription: async () => {
    const response = await api.post('/payments/cancel-subscription');
    return response.data;
  },

  reactivateSubscription: async () => {
    const response = await api.post('/payments/reactivate-subscription');
    return response.data;
  },

  getSubscriptionStatus: async () => {
    const response = await api.get('/payments/subscription-status');
    return response.data;
  },
};

export const chatbotService = {
  sendMessage: async (message, userInfo = {}) => {
    const response = await api.post('/chatbot/message', { message, userInfo });
    return response.data;
  },

  getSuggestions: async () => {
    const response = await api.get('/chatbot/suggestions');
    return response.data;
  },

  clearSession: async () => {
    const response = await api.delete('/chatbot/session');
    return response.data;
  },
};
