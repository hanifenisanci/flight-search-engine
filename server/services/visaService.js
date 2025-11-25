// Visa requirements data (simplified - in production use a real API)
const visaRequirements = {
  // Key: citizenshipCountryCode
  US: {
    visa_free: ['CA', 'MX', 'GB', 'FR', 'DE', 'IT', 'ES', 'JP', 'KR', 'AU'],
    visa_on_arrival: ['TR'],
    evisa: ['IN', 'KE', 'EG'],
    visa_required: ['CN', 'RU', 'BR', 'ZA'],
  },
  TR: {
    visa_free: ['DE', 'FR', 'IT', 'ES', 'GB', 'JP', 'KR', 'AZ', 'GE'],
    visa_on_arrival: ['JO', 'LB'],
    evisa: ['US', 'CA', 'AU', 'CN', 'IN', 'RU'],
    visa_required: ['BR', 'ZA', 'NG'],
  },
  // Add more countries as needed
};

// Check visa requirement for a citizenship and destination
exports.checkVisaRequirement = (citizenship, destination) => {
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

  if (citizenshipData.visa_on_arrival.includes(destination)) {
    return {
      required: true,
      type: 'visa_on_arrival',
      note: 'Visa available on arrival',
    };
  }

  if (citizenshipData.evisa.includes(destination)) {
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
};

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

module.exports = visaRequirements;
