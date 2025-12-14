const axios = require('axios');

// Check visa requirement using free Passport Index API
exports.checkVisaRequirement = async (citizenship, destination) => {
  try {
    // Use the free visa API (no authentication required)
    const response = await axios.get(
      `https://rough-sun-2523.fly.dev/visa/${citizenship}/${destination}`,
      { timeout: 5000 }
    );

    const data = response.data;
    const categoryName = data.category?.name?.toLowerCase() || 'visa required';
    
    return {
      required: categoryName !== 'visa free' && categoryName !== 'freedom of movement',
      type: categoryName.replace(/ /g, '_'),
      note: getVisaNoteFromCategory(categoryName),
      duration: data.dur || null,
      passportCountry: data.passport?.name,
      destinationCountry: data.destination?.name,
      lastUpdated: data.last_updated,
      details: data
    };

  } catch (error) {
    // Silently use fallback data if API is down (no console spam)
    return getFallbackVisaData(citizenship, destination);
  }
};

// Helper function to get readable note from category
function getVisaNoteFromCategory(category) {
  const notes = {
    'visa free': 'No visa required - visa-free travel',
    'visa on arrival': 'Visa available on arrival at the airport',
    'e-visa': 'Electronic visa (eVisa) - apply online',
    'visa required': 'Visa required - apply at embassy/consulate',
    'eta': 'Electronic Travel Authorization required',
    'covid ban': 'Travel restricted due to COVID-19',
    'no admission': 'Travel not permitted',
    'freedom of movement': 'Freedom of movement - no restrictions'
  };
  return notes[category] || 'Please check with embassy for requirements';
}

// Fallback visa data (simplified)
function getFallbackVisaData(citizenship, destination) {
  const visaRequirements = {
    US: {
      visa_free: ['CA', 'MX', 'GB', 'FR', 'DE', 'IT', 'ES', 'JP', 'KR', 'AU', 'NZ', 'IE', 'CH', 'NO', 'SE'],
      evisa: ['IN', 'KE', 'EG', 'TR'],
      visa_required: ['CN', 'RU', 'BR', 'ZA', 'VN', 'ID'],
    },
    TR: {
      visa_free: ['RS', 'BA', 'MK', 'AL', 'ME', 'MD', 'UA', 'GE', 'AZ', 'KZ', 'KG', 'TJ', 'UZ', 'TM', 'MN', 'MY', 'SG', 'TH', 'PH', 'HK', 'MO', 'KR', 'JP', 'TW', 'CL', 'AR', 'BR', 'EC', 'CO', 'PA', 'MX', 'ZA', 'MA', 'TN'],
      evisa: ['AU', 'NZ', 'IN', 'KE', 'OM', 'BH', 'KW', 'QA', 'SA'],
      visa_required: ['US', 'CA', 'GB', 'IE', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'CH', 'SE', 'NO', 'DK', 'FI', 'PL', 'CZ', 'HU', 'GR', 'PT', 'CN', 'RU', 'EG', 'AE'],
    },
  };

  const citizenshipData = visaRequirements[citizenship];
  
  if (!citizenshipData) {
    return {
      required: true,
      type: 'visa_required',
      note: 'Please check with the embassy',
    };
  }

  if (citizenshipData.visa_free.includes(destination)) {
    return {
      required: false,
      type: 'visa_free',
      note: 'No visa required',
    };
  }

  if (citizenshipData.evisa && citizenshipData.evisa.includes(destination)) {
    return {
      required: true,
      type: 'evisa',
      note: 'Electronic visa available online',
    };
  }

  return {
    required: true,
    type: 'visa_required',
    note: 'Visa required - apply at embassy',
  };
}

// Get recommended destinations based on citizenship and existing visas
exports.getRecommendedDestinations = (citizenship, existingVisas = []) => {
  const citizenshipData = visaRequirements[citizenship];
  
  if (!citizenshipData) {
    return [];
  }

  const recommendations = [];

  // Add visa-free destinations with high score
  citizenshipData.visa_free.forEach((country) => {
    recommendations.push({
      country,
      visaRequired: false,
      visaType: 'visa_free',
      score: 95,
      reason: 'Visa-free travel available',
    });
  });

  // Add e-visa destinations with medium-high score
  citizenshipData.evisa.forEach((country) => {
    recommendations.push({
      country,
      visaRequired: true,
      visaType: 'evisa',
      score: 75,
      reason: 'Easy electronic visa application',
    });
  });

  // Add visa on arrival with medium score
  citizenshipData.visa_on_arrival.forEach((country) => {
    recommendations.push({
      country,
      visaRequired: true,
      visaType: 'visa_on_arrival',
      score: 70,
      reason: 'Visa available on arrival',
    });
  });

  // Boost score for countries where user already has visa
  existingVisas.forEach((visa) => {
    const existing = recommendations.find((r) => r.country === visa.country);
    if (existing) {
      existing.score = 100;
      existing.reason = 'You already have a valid visa';
    } else {
      recommendations.push({
        country: visa.country,
        visaRequired: false,
        visaType: 'existing_visa',
        score: 100,
        reason: 'You already have a valid visa',
      });
    }
  });

  return recommendations.sort((a, b) => b.score - a.score);
};

// Get popular destinations by season
exports.getSeasonalDestinations = (month) => {
  const seasonal = {
    winter: ['TH', 'MY', 'SG', 'AE', 'EG'], // Dec-Feb
    spring: ['JP', 'NL', 'TR', 'GR', 'ES'], // Mar-May
    summer: ['IT', 'FR', 'GB', 'IS', 'NO'], // Jun-Aug
    fall: ['US', 'CA', 'DE', 'AT', 'CH'],   // Sep-Nov
  };

  if (month >= 12 || month <= 2) return seasonal.winter;
  if (month >= 3 && month <= 5) return seasonal.spring;
  if (month >= 6 && month <= 8) return seasonal.summer;
  return seasonal.fall;
};
