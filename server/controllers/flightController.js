const Flight = require('../models/Flight');
const User = require('../models/User');
const Recommendation = require('../models/Recommendation');
const amadeusService = require('../services/amadeusService');
const visaService = require('../services/visaService');

// @desc    Search flights
// @route   GET /api/flights/search
// @access  Private
exports.searchFlights = async (req, res) => {
  try {
    const { origin, destination, departureDate, returnDate, adults, travelClass } = req.query;

    if (!origin || !destination || !departureDate) {
      return res.status(400).json({
        success: false,
        error: 'Please provide origin, destination, and departure date',
      });
    }

    // Save search to user history (optional, don't fail if it doesn't work)
    if (req.user && req.user.id) {
      try {
        await User.findByIdAndUpdate(req.user.id, {
          $push: {
            searchHistory: {
              origin,
              destination,
              departureDate,
              returnDate,
            },
          },
        });
      } catch (historyError) {
        console.log('Failed to save search history:', historyError.message);
      }
    }

    // Search flights using Amadeus
    const flights = await amadeusService.searchFlights({
      origin,
      destination,
      departureDate,
      returnDate,
      adults: adults || 1,
      travelClass: travelClass || 'ECONOMY',
    });

    res.json({
      success: true,
      count: flights.length,
      data: flights,
    });
  } catch (error) {
    console.error('Flight Search Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Get personalized flight recommendations with AI descriptions
// @route   GET /api/flights/recommendations
// @access  Private
exports.getRecommendations = async (req, res) => {
  try {
    const { origin } = req.query;

    if (!origin) {
      return res.status(400).json({
        success: false,
        error: 'Please provide origin airport code',
      });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Please login to get personalized recommendations',
      });
    }

    const user = await User.findById(req.user.id);
    const userCitizenship = user.citizenship;
    const originCountry = getCountryFromAirport(origin);

    // 300 Popular destination cities with their airports
    const destinations = [
      // Europe (100)
      { city: 'Paris', country: 'FR', airport: 'CDG', name: 'Paris, France' },
      { city: 'London', country: 'GB', airport: 'LHR', name: 'London, United Kingdom' },
      { city: 'Barcelona', country: 'ES', airport: 'BCN', name: 'Barcelona, Spain' },
      { city: 'Rome', country: 'IT', airport: 'FCO', name: 'Rome, Italy' },
      { city: 'Amsterdam', country: 'NL', airport: 'AMS', name: 'Amsterdam, Netherlands' },
      { city: 'Istanbul', country: 'TR', airport: 'IST', name: 'Istanbul, Turkey' },
      { city: 'Berlin', country: 'DE', airport: 'BER', name: 'Berlin, Germany' },
      { city: 'Prague', country: 'CZ', airport: 'PRG', name: 'Prague, Czech Republic' },
      { city: 'Vienna', country: 'AT', airport: 'VIE', name: 'Vienna, Austria' },
      { city: 'Lisbon', country: 'PT', airport: 'LIS', name: 'Lisbon, Portugal' },
      { city: 'Athens', country: 'GR', airport: 'ATH', name: 'Athens, Greece' },
      { city: 'Budapest', country: 'HU', airport: 'BUD', name: 'Budapest, Hungary' },
      { city: 'Copenhagen', country: 'DK', airport: 'CPH', name: 'Copenhagen, Denmark' },
      { city: 'Madrid', country: 'ES', airport: 'MAD', name: 'Madrid, Spain' },
      { city: 'Munich', country: 'DE', airport: 'MUC', name: 'Munich, Germany' },
      { city: 'Milan', country: 'IT', airport: 'MXP', name: 'Milan, Italy' },
      { city: 'Dublin', country: 'IE', airport: 'DUB', name: 'Dublin, Ireland' },
      { city: 'Brussels', country: 'BE', airport: 'BRU', name: 'Brussels, Belgium' },
      { city: 'Zurich', country: 'CH', airport: 'ZRH', name: 'Zurich, Switzerland' },
      { city: 'Stockholm', country: 'SE', airport: 'ARN', name: 'Stockholm, Sweden' },
      { city: 'Warsaw', country: 'PL', airport: 'WAW', name: 'Warsaw, Poland' },
      { city: 'Oslo', country: 'NO', airport: 'OSL', name: 'Oslo, Norway' },
      { city: 'Helsinki', country: 'FI', airport: 'HEL', name: 'Helsinki, Finland' },
      { city: 'Edinburgh', country: 'GB', airport: 'EDI', name: 'Edinburgh, United Kingdom' },
      { city: 'Venice', country: 'IT', airport: 'VCE', name: 'Venice, Italy' },
      { city: 'Florence', country: 'IT', airport: 'FLR', name: 'Florence, Italy' },
      { city: 'Nice', country: 'FR', airport: 'NCE', name: 'Nice, France' },
      { city: 'Porto', country: 'PT', airport: 'OPO', name: 'Porto, Portugal' },
      { city: 'Seville', country: 'ES', airport: 'SVQ', name: 'Seville, Spain' },
      { city: 'Valencia', country: 'ES', airport: 'VLC', name: 'Valencia, Spain' },
      { city: 'Krakow', country: 'PL', airport: 'KRK', name: 'Krakow, Poland' },
      { city: 'Reykjavik', country: 'IS', airport: 'KEF', name: 'Reykjavik, Iceland' },
      { city: 'Luxembourg', country: 'LU', airport: 'LUX', name: 'Luxembourg City, Luxembourg' },
      { city: 'Geneva', country: 'CH', airport: 'GVA', name: 'Geneva, Switzerland' },
      { city: 'Hamburg', country: 'DE', airport: 'HAM', name: 'Hamburg, Germany' },
      { city: 'Frankfurt', country: 'DE', airport: 'FRA', name: 'Frankfurt, Germany' },
      { city: 'Lyon', country: 'FR', airport: 'LYS', name: 'Lyon, France' },
      { city: 'Marseille', country: 'FR', airport: 'MRS', name: 'Marseille, France' },
      { city: 'Manchester', country: 'GB', airport: 'MAN', name: 'Manchester, United Kingdom' },
      { city: 'Birmingham', country: 'GB', airport: 'BHX', name: 'Birmingham, United Kingdom' },
      { city: 'Naples', country: 'IT', airport: 'NAP', name: 'Naples, Italy' },
      { city: 'Bologna', country: 'IT', airport: 'BLQ', name: 'Bologna, Italy' },
      { city: 'Dubrovnik', country: 'HR', airport: 'DBV', name: 'Dubrovnik, Croatia' },
      { city: 'Zagreb', country: 'HR', airport: 'ZAG', name: 'Zagreb, Croatia' },
      { city: 'Split', country: 'HR', airport: 'SPU', name: 'Split, Croatia' },
      { city: 'Bucharest', country: 'RO', airport: 'OTP', name: 'Bucharest, Romania' },
      { city: 'Sofia', country: 'BG', airport: 'SOF', name: 'Sofia, Bulgaria' },
      { city: 'Belgrade', country: 'RS', airport: 'BEG', name: 'Belgrade, Serbia' },
      { city: 'Bratislava', country: 'SK', airport: 'BTS', name: 'Bratislava, Slovakia' },
      { city: 'Ljubljana', country: 'SI', airport: 'LJU', name: 'Ljubljana, Slovenia' },
      { city: 'Tallinn', country: 'EE', airport: 'TLL', name: 'Tallinn, Estonia' },
      { city: 'Riga', country: 'LV', airport: 'RIX', name: 'Riga, Latvia' },
      { city: 'Vilnius', country: 'LT', airport: 'VNO', name: 'Vilnius, Lithuania' },
      { city: 'Santorini', country: 'GR', airport: 'JTR', name: 'Santorini, Greece' },
      { city: 'Mykonos', country: 'GR', airport: 'JMK', name: 'Mykonos, Greece' },
      { city: 'Crete', country: 'GR', airport: 'HER', name: 'Crete, Greece' },
      { city: 'Rhodes', country: 'GR', airport: 'RHO', name: 'Rhodes, Greece' },
      { city: 'Malta', country: 'MT', airport: 'MLA', name: 'Malta' },
      { city: 'Palermo', country: 'IT', airport: 'PMO', name: 'Palermo, Italy' },
      { city: 'Catania', country: 'IT', airport: 'CTA', name: 'Catania, Italy' },
      { city: 'Sardinia', country: 'IT', airport: 'CAG', name: 'Sardinia, Italy' },
      { city: 'Cologne', country: 'DE', airport: 'CGN', name: 'Cologne, Germany' },
      { city: 'Dusseldorf', country: 'DE', airport: 'DUS', name: 'Dusseldorf, Germany' },
      { city: 'Stuttgart', country: 'DE', airport: 'STR', name: 'Stuttgart, Germany' },
      { city: 'Nuremberg', country: 'DE', airport: 'NUE', name: 'Nuremberg, Germany' },
      { city: 'Dresden', country: 'DE', airport: 'DRS', name: 'Dresden, Germany' },
      { city: 'Leipzig', country: 'DE', airport: 'LEJ', name: 'Leipzig, Germany' },
      { city: 'Toulouse', country: 'FR', airport: 'TLS', name: 'Toulouse, France' },
      { city: 'Bordeaux', country: 'FR', airport: 'BOD', name: 'Bordeaux, France' },
      { city: 'Nantes', country: 'FR', airport: 'NTE', name: 'Nantes, France' },
      { city: 'Strasbourg', country: 'FR', airport: 'SXB', name: 'Strasbourg, France' },
      { city: 'Lille', country: 'FR', airport: 'LIL', name: 'Lille, France' },
      { city: 'Bilbao', country: 'ES', airport: 'BIO', name: 'Bilbao, Spain' },
      { city: 'Granada', country: 'ES', airport: 'GRX', name: 'Granada, Spain' },
      { city: 'Malaga', country: 'ES', airport: 'AGP', name: 'Malaga, Spain' },
      { city: 'Palma', country: 'ES', airport: 'PMI', name: 'Palma de Mallorca, Spain' },
      { city: 'Ibiza', country: 'ES', airport: 'IBZ', name: 'Ibiza, Spain' },
      { city: 'Alicante', country: 'ES', airport: 'ALC', name: 'Alicante, Spain' },
      { city: 'Bergen', country: 'NO', airport: 'BGO', name: 'Bergen, Norway' },
      { city: 'Tromso', country: 'NO', airport: 'TOS', name: 'Tromso, Norway' },
      { city: 'Gothenburg', country: 'SE', airport: 'GOT', name: 'Gothenburg, Sweden' },
      { city: 'Malmo', country: 'SE', airport: 'MMX', name: 'Malmo, Sweden' },
      { city: 'Aarhus', country: 'DK', airport: 'AAR', name: 'Aarhus, Denmark' },
      { city: 'Billund', country: 'DK', airport: 'BLL', name: 'Billund, Denmark' },
      { city: 'Turku', country: 'FI', airport: 'TKU', name: 'Turku, Finland' },
      { city: 'Tampere', country: 'FI', airport: 'TMP', name: 'Tampere, Finland' },
      { city: 'Gdansk', country: 'PL', airport: 'GDN', name: 'Gdansk, Poland' },
      { city: 'Wroclaw', country: 'PL', airport: 'WRO', name: 'Wroclaw, Poland' },
      { city: 'Poznan', country: 'PL', airport: 'POZ', name: 'Poznan, Poland' },
      { city: 'Thessaloniki', country: 'GR', airport: 'SKG', name: 'Thessaloniki, Greece' },
      { city: 'Corfu', country: 'GR', airport: 'CFU', name: 'Corfu, Greece' },
      { city: 'Zante', country: 'GR', airport: 'ZTH', name: 'Zakynthos, Greece' },
      { city: 'Faro', country: 'PT', airport: 'FAO', name: 'Faro, Portugal' },
      { city: 'Funchal', country: 'PT', airport: 'FNC', name: 'Funchal, Portugal' },
      { city: 'Innsbruck', country: 'AT', airport: 'INN', name: 'Innsbruck, Austria' },
      { city: 'Salzburg', country: 'AT', airport: 'SZG', name: 'Salzburg, Austria' },
      
      // Asia (80)
      { city: 'Tokyo', country: 'JP', airport: 'NRT', name: 'Tokyo, Japan' },
      { city: 'Bangkok', country: 'TH', airport: 'BKK', name: 'Bangkok, Thailand' },
      { city: 'Singapore', country: 'SG', airport: 'SIN', name: 'Singapore' },
      { city: 'Hong Kong', country: 'HK', airport: 'HKG', name: 'Hong Kong' },
      { city: 'Dubai', country: 'AE', airport: 'DXB', name: 'Dubai, UAE' },
      { city: 'Bali', country: 'ID', airport: 'DPS', name: 'Bali, Indonesia' },
      { city: 'Seoul', country: 'KR', airport: 'ICN', name: 'Seoul, South Korea' },
      { city: 'Phuket', country: 'TH', airport: 'HKT', name: 'Phuket, Thailand' },
      { city: 'Osaka', country: 'JP', airport: 'KIX', name: 'Osaka, Japan' },
      { city: 'Kyoto', country: 'JP', airport: 'UKY', name: 'Kyoto, Japan' },
      { city: 'Jakarta', country: 'ID', airport: 'CGK', name: 'Jakarta, Indonesia' },
      { city: 'Kuala Lumpur', country: 'MY', airport: 'KUL', name: 'Kuala Lumpur, Malaysia' },
      { city: 'Manila', country: 'PH', airport: 'MNL', name: 'Manila, Philippines' },
      { city: 'Hanoi', country: 'VN', airport: 'HAN', name: 'Hanoi, Vietnam' },
      { city: 'Ho Chi Minh City', country: 'VN', airport: 'SGN', name: 'Ho Chi Minh City, Vietnam' },
      { city: 'Taipei', country: 'TW', airport: 'TPE', name: 'Taipei, Taiwan' },
      { city: 'Shanghai', country: 'CN', airport: 'PVG', name: 'Shanghai, China' },
      { city: 'Beijing', country: 'CN', airport: 'PEK', name: 'Beijing, China' },
      { city: 'Chiang Mai', country: 'TH', airport: 'CNX', name: 'Chiang Mai, Thailand' },
      { city: 'Krabi', country: 'TH', airport: 'KBV', name: 'Krabi, Thailand' },
      { city: 'Colombo', country: 'LK', airport: 'CMB', name: 'Colombo, Sri Lanka' },
      { city: 'New Delhi', country: 'IN', airport: 'DEL', name: 'New Delhi, India' },
      { city: 'Mumbai', country: 'IN', airport: 'BOM', name: 'Mumbai, India' },
      { city: 'Bengaluru', country: 'IN', airport: 'BLR', name: 'Bengaluru, India' },
      { city: 'Chennai', country: 'IN', airport: 'MAA', name: 'Chennai, India' },
      { city: 'Goa', country: 'IN', airport: 'GOI', name: 'Goa, India' },
      { city: 'Jaipur', country: 'IN', airport: 'JAI', name: 'Jaipur, India' },
      { city: 'Kathmandu', country: 'NP', airport: 'KTM', name: 'Kathmandu, Nepal' },
      { city: 'Maldives', country: 'MV', airport: 'MLE', name: 'Male, Maldives' },
      { city: 'Abu Dhabi', country: 'AE', airport: 'AUH', name: 'Abu Dhabi, UAE' },
      { city: 'Doha', country: 'QA', airport: 'DOH', name: 'Doha, Qatar' },
      { city: 'Muscat', country: 'OM', airport: 'MCT', name: 'Muscat, Oman' },
      { city: 'Tel Aviv', country: 'IL', airport: 'TLV', name: 'Tel Aviv, Israel' },
      { city: 'Amman', country: 'JO', airport: 'AMM', name: 'Amman, Jordan' },
      { city: 'Beirut', country: 'LB', airport: 'BEY', name: 'Beirut, Lebanon' },
      { city: 'Riyadh', country: 'SA', airport: 'RUH', name: 'Riyadh, Saudi Arabia' },
      { city: 'Jeddah', country: 'SA', airport: 'JED', name: 'Jeddah, Saudi Arabia' },
      { city: 'Kuwait City', country: 'KW', airport: 'KWI', name: 'Kuwait City, Kuwait' },
      { city: 'Manama', country: 'BH', airport: 'BAH', name: 'Manama, Bahrain' },
      { city: 'Sapporo', country: 'JP', airport: 'CTS', name: 'Sapporo, Japan' },
      { city: 'Fukuoka', country: 'JP', airport: 'FUK', name: 'Fukuoka, Japan' },
      { city: 'Okinawa', country: 'JP', airport: 'OKA', name: 'Okinawa, Japan' },
      { city: 'Busan', country: 'KR', airport: 'PUS', name: 'Busan, South Korea' },
      { city: 'Jeju', country: 'KR', airport: 'CJU', name: 'Jeju, South Korea' },
      { city: 'Cebu', country: 'PH', airport: 'CEB', name: 'Cebu, Philippines' },
      { city: 'Boracay', country: 'PH', airport: 'MPH', name: 'Boracay, Philippines' },
      { city: 'Penang', country: 'MY', airport: 'PEN', name: 'Penang, Malaysia' },
      { city: 'Langkawi', country: 'MY', airport: 'LGK', name: 'Langkawi, Malaysia' },
      { city: 'Kota Kinabalu', country: 'MY', airport: 'BKI', name: 'Kota Kinabalu, Malaysia' },
      { city: 'Siem Reap', country: 'KH', airport: 'REP', name: 'Siem Reap, Cambodia' },
      { city: 'Phnom Penh', country: 'KH', airport: 'PNH', name: 'Phnom Penh, Cambodia' },
      { city: 'Vientiane', country: 'LA', airport: 'VTE', name: 'Vientiane, Laos' },
      { city: 'Luang Prabang', country: 'LA', airport: 'LPQ', name: 'Luang Prabang, Laos' },
      { city: 'Yangon', country: 'MM', airport: 'RGN', name: 'Yangon, Myanmar' },
      { city: 'Mandalay', country: 'MM', airport: 'MDL', name: 'Mandalay, Myanmar' },
      { city: 'Dhaka', country: 'BD', airport: 'DAC', name: 'Dhaka, Bangladesh' },
      { city: 'Guangzhou', country: 'CN', airport: 'CAN', name: 'Guangzhou, China' },
      { city: 'Shenzhen', country: 'CN', airport: 'SZX', name: 'Shenzhen, China' },
      { city: 'Chengdu', country: 'CN', airport: 'CTU', name: 'Chengdu, China' },
      { city: 'Xian', country: 'CN', airport: 'XIY', name: 'Xian, China' },
      { city: 'Hangzhou', country: 'CN', airport: 'HGH', name: 'Hangzhou, China' },
      { city: 'Nanjing', country: 'CN', airport: 'NKG', name: 'Nanjing, China' },
      { city: 'Suzhou', country: 'CN', airport: 'SZV', name: 'Suzhou, China' },
      { city: 'Macau', country: 'MO', airport: 'MFM', name: 'Macau' },
      { city: 'Ulaanbaatar', country: 'MN', airport: 'ULN', name: 'Ulaanbaatar, Mongolia' },
      { city: 'Tashkent', country: 'UZ', airport: 'TAS', name: 'Tashkent, Uzbekistan' },
      { city: 'Samarkand', country: 'UZ', airport: 'SKD', name: 'Samarkand, Uzbekistan' },
      { city: 'Tbilisi', country: 'GE', airport: 'TBS', name: 'Tbilisi, Georgia' },
      { city: 'Batumi', country: 'GE', airport: 'BUS', name: 'Batumi, Georgia' },
      { city: 'Yerevan', country: 'AM', airport: 'EVN', name: 'Yerevan, Armenia' },
      { city: 'Baku', country: 'AZ', airport: 'GYD', name: 'Baku, Azerbaijan' },
      { city: 'Almaty', country: 'KZ', airport: 'ALA', name: 'Almaty, Kazakhstan' },
      { city: 'Astana', country: 'KZ', airport: 'NQZ', name: 'Astana, Kazakhstan' },
      { city: 'Bishkek', country: 'KG', airport: 'FRU', name: 'Bishkek, Kyrgyzstan' },
      
      // Americas (60)
      { city: 'New York', country: 'US', airport: 'JFK', name: 'New York, USA' },
      { city: 'Los Angeles', country: 'US', airport: 'LAX', name: 'Los Angeles, USA' },
      { city: 'Miami', country: 'US', airport: 'MIA', name: 'Miami, USA' },
      { city: 'San Francisco', country: 'US', airport: 'SFO', name: 'San Francisco, USA' },
      { city: 'Las Vegas', country: 'US', airport: 'LAS', name: 'Las Vegas, USA' },
      { city: 'Orlando', country: 'US', airport: 'MCO', name: 'Orlando, USA' },
      { city: 'Chicago', country: 'US', airport: 'ORD', name: 'Chicago, USA' },
      { city: 'Seattle', country: 'US', airport: 'SEA', name: 'Seattle, USA' },
      { city: 'Boston', country: 'US', airport: 'BOS', name: 'Boston, USA' },
      { city: 'Washington DC', country: 'US', airport: 'IAD', name: 'Washington DC, USA' },
      { city: 'Atlanta', country: 'US', airport: 'ATL', name: 'Atlanta, USA' },
      { city: 'Dallas', country: 'US', airport: 'DFW', name: 'Dallas, USA' },
      { city: 'Houston', country: 'US', airport: 'IAH', name: 'Houston, USA' },
      { city: 'Phoenix', country: 'US', airport: 'PHX', name: 'Phoenix, USA' },
      { city: 'San Diego', country: 'US', airport: 'SAN', name: 'San Diego, USA' },
      { city: 'Denver', country: 'US', airport: 'DEN', name: 'Denver, USA' },
      { city: 'Portland', country: 'US', airport: 'PDX', name: 'Portland, USA' },
      { city: 'Austin', country: 'US', airport: 'AUS', name: 'Austin, USA' },
      { city: 'Nashville', country: 'US', airport: 'BNA', name: 'Nashville, USA' },
      { city: 'New Orleans', country: 'US', airport: 'MSY', name: 'New Orleans, USA' },
      { city: 'Philadelphia', country: 'US', airport: 'PHL', name: 'Philadelphia, USA' },
      { city: 'Detroit', country: 'US', airport: 'DTW', name: 'Detroit, USA' },
      { city: 'Minneapolis', country: 'US', airport: 'MSP', name: 'Minneapolis, USA' },
      { city: 'Honolulu', country: 'US', airport: 'HNL', name: 'Honolulu, USA' },
      { city: 'Anchorage', country: 'US', airport: 'ANC', name: 'Anchorage, USA' },
      { city: 'Toronto', country: 'CA', airport: 'YYZ', name: 'Toronto, Canada' },
      { city: 'Vancouver', country: 'CA', airport: 'YVR', name: 'Vancouver, Canada' },
      { city: 'Montreal', country: 'CA', airport: 'YUL', name: 'Montreal, Canada' },
      { city: 'Calgary', country: 'CA', airport: 'YYC', name: 'Calgary, Canada' },
      { city: 'Ottawa', country: 'CA', airport: 'YOW', name: 'Ottawa, Canada' },
      { city: 'Quebec City', country: 'CA', airport: 'YQB', name: 'Quebec City, Canada' },
      { city: 'Mexico City', country: 'MX', airport: 'MEX', name: 'Mexico City, Mexico' },
      { city: 'Cancun', country: 'MX', airport: 'CUN', name: 'Cancun, Mexico' },
      { city: 'Guadalajara', country: 'MX', airport: 'GDL', name: 'Guadalajara, Mexico' },
      { city: 'Monterrey', country: 'MX', airport: 'MTY', name: 'Monterrey, Mexico' },
      { city: 'Cabo San Lucas', country: 'MX', airport: 'SJD', name: 'Cabo San Lucas, Mexico' },
      { city: 'Puerto Vallarta', country: 'MX', airport: 'PVR', name: 'Puerto Vallarta, Mexico' },
      { city: 'Havana', country: 'CU', airport: 'HAV', name: 'Havana, Cuba' },
      { city: 'San Juan', country: 'PR', airport: 'SJU', name: 'San Juan, Puerto Rico' },
      { city: 'Punta Cana', country: 'DO', airport: 'PUJ', name: 'Punta Cana, Dominican Republic' },
      { city: 'Santo Domingo', country: 'DO', airport: 'SDQ', name: 'Santo Domingo, Dominican Republic' },
      { city: 'Kingston', country: 'JM', airport: 'KIN', name: 'Kingston, Jamaica' },
      { city: 'Montego Bay', country: 'JM', airport: 'MBJ', name: 'Montego Bay, Jamaica' },
      { city: 'Nassau', country: 'BS', airport: 'NAS', name: 'Nassau, Bahamas' },
      { city: 'Barbados', country: 'BB', airport: 'BGI', name: 'Bridgetown, Barbados' },
      { city: 'Aruba', country: 'AW', airport: 'AUA', name: 'Oranjestad, Aruba' },
      { city: 'Panama City', country: 'PA', airport: 'PTY', name: 'Panama City, Panama' },
      { city: 'San Jose', country: 'CR', airport: 'SJO', name: 'San Jose, Costa Rica' },
      { city: 'Guatemala City', country: 'GT', airport: 'GUA', name: 'Guatemala City, Guatemala' },
      { city: 'Bogota', country: 'CO', airport: 'BOG', name: 'Bogota, Colombia' },
      { city: 'Medellin', country: 'CO', airport: 'MDE', name: 'Medellin, Colombia' },
      { city: 'Cartagena', country: 'CO', airport: 'CTG', name: 'Cartagena, Colombia' },
      { city: 'Lima', country: 'PE', airport: 'LIM', name: 'Lima, Peru' },
      { city: 'Cusco', country: 'PE', airport: 'CUZ', name: 'Cusco, Peru' },
      { city: 'Santiago', country: 'CL', airport: 'SCL', name: 'Santiago, Chile' },
      { city: 'Buenos Aires', country: 'AR', airport: 'EZE', name: 'Buenos Aires, Argentina' },
      { city: 'Rio de Janeiro', country: 'BR', airport: 'GIG', name: 'Rio de Janeiro, Brazil' },
      { city: 'Sao Paulo', country: 'BR', airport: 'GRU', name: 'Sao Paulo, Brazil' },
      { city: 'Brasilia', country: 'BR', airport: 'BSB', name: 'Brasilia, Brazil' },
      { city: 'Quito', country: 'EC', airport: 'UIO', name: 'Quito, Ecuador' },
      
      // Africa (30)
      { city: 'Cairo', country: 'EG', airport: 'CAI', name: 'Cairo, Egypt' },
      { city: 'Marrakech', country: 'MA', airport: 'RAK', name: 'Marrakech, Morocco' },
      { city: 'Casablanca', country: 'MA', airport: 'CMN', name: 'Casablanca, Morocco' },
      { city: 'Cape Town', country: 'ZA', airport: 'CPT', name: 'Cape Town, South Africa' },
      { city: 'Johannesburg', country: 'ZA', airport: 'JNB', name: 'Johannesburg, South Africa' },
      { city: 'Durban', country: 'ZA', airport: 'DUR', name: 'Durban, South Africa' },
      { city: 'Nairobi', country: 'KE', airport: 'NBO', name: 'Nairobi, Kenya' },
      { city: 'Mombasa', country: 'KE', airport: 'MBA', name: 'Mombasa, Kenya' },
      { city: 'Zanzibar', country: 'TZ', airport: 'ZNZ', name: 'Zanzibar, Tanzania' },
      { city: 'Dar es Salaam', country: 'TZ', airport: 'DAR', name: 'Dar es Salaam, Tanzania' },
      { city: 'Addis Ababa', country: 'ET', airport: 'ADD', name: 'Addis Ababa, Ethiopia' },
      { city: 'Lagos', country: 'NG', airport: 'LOS', name: 'Lagos, Nigeria' },
      { city: 'Abuja', country: 'NG', airport: 'ABV', name: 'Abuja, Nigeria' },
      { city: 'Accra', country: 'GH', airport: 'ACC', name: 'Accra, Ghana' },
      { city: 'Dakar', country: 'SN', airport: 'DSS', name: 'Dakar, Senegal' },
      { city: 'Tunis', country: 'TN', airport: 'TUN', name: 'Tunis, Tunisia' },
      { city: 'Algiers', country: 'DZ', airport: 'ALG', name: 'Algiers, Algeria' },
      { city: 'Sharm El Sheikh', country: 'EG', airport: 'SSH', name: 'Sharm El Sheikh, Egypt' },
      { city: 'Hurghada', country: 'EG', airport: 'HRG', name: 'Hurghada, Egypt' },
      { city: 'Luxor', country: 'EG', airport: 'LXR', name: 'Luxor, Egypt' },
      { city: 'Mauritius', country: 'MU', airport: 'MRU', name: 'Port Louis, Mauritius' },
      { city: 'Seychelles', country: 'SC', airport: 'SEZ', name: 'Mahe, Seychelles' },
      { city: 'Kigali', country: 'RW', airport: 'KGL', name: 'Kigali, Rwanda' },
      { city: 'Kampala', country: 'UG', airport: 'EBB', name: 'Kampala, Uganda' },
      { city: 'Windhoek', country: 'NA', airport: 'WDH', name: 'Windhoek, Namibia' },
      { city: 'Luanda', country: 'AO', airport: 'LAD', name: 'Luanda, Angola' },
      { city: 'Maputo', country: 'MZ', airport: 'MPM', name: 'Maputo, Mozambique' },
      { city: 'Lusaka', country: 'ZM', airport: 'LUN', name: 'Lusaka, Zambia' },
      { city: 'Harare', country: 'ZW', airport: 'HRE', name: 'Harare, Zimbabwe' },
      { city: 'Victoria Falls', country: 'ZW', airport: 'VFA', name: 'Victoria Falls, Zimbabwe' },
      
      // Oceania (30)
      { city: 'Sydney', country: 'AU', airport: 'SYD', name: 'Sydney, Australia' },
      { city: 'Melbourne', country: 'AU', airport: 'MEL', name: 'Melbourne, Australia' },
      { city: 'Brisbane', country: 'AU', airport: 'BNE', name: 'Brisbane, Australia' },
      { city: 'Perth', country: 'AU', airport: 'PER', name: 'Perth, Australia' },
      { city: 'Adelaide', country: 'AU', airport: 'ADL', name: 'Adelaide, Australia' },
      { city: 'Gold Coast', country: 'AU', airport: 'OOL', name: 'Gold Coast, Australia' },
      { city: 'Cairns', country: 'AU', airport: 'CNS', name: 'Cairns, Australia' },
      { city: 'Hobart', country: 'AU', airport: 'HBA', name: 'Hobart, Australia' },
      { city: 'Darwin', country: 'AU', airport: 'DRW', name: 'Darwin, Australia' },
      { city: 'Canberra', country: 'AU', airport: 'CBR', name: 'Canberra, Australia' },
      { city: 'Auckland', country: 'NZ', airport: 'AKL', name: 'Auckland, New Zealand' },
      { city: 'Wellington', country: 'NZ', airport: 'WLG', name: 'Wellington, New Zealand' },
      { city: 'Christchurch', country: 'NZ', airport: 'CHC', name: 'Christchurch, New Zealand' },
      { city: 'Queenstown', country: 'NZ', airport: 'ZQN', name: 'Queenstown, New Zealand' },
      { city: 'Dunedin', country: 'NZ', airport: 'DUD', name: 'Dunedin, New Zealand' },
      { city: 'Fiji', country: 'FJ', airport: 'NAN', name: 'Nadi, Fiji' },
      { city: 'Tahiti', country: 'PF', airport: 'PPT', name: 'Papeete, Tahiti' },
      { city: 'Bora Bora', country: 'PF', airport: 'BOB', name: 'Bora Bora, French Polynesia' },
      { city: 'Port Vila', country: 'VU', airport: 'VLI', name: 'Port Vila, Vanuatu' },
      { city: 'Noumea', country: 'NC', airport: 'NOU', name: 'Noumea, New Caledonia' },
      { city: 'Port Moresby', country: 'PG', airport: 'POM', name: 'Port Moresby, Papua New Guinea' },
      { city: 'Apia', country: 'WS', airport: 'APW', name: 'Apia, Samoa' },
      { city: 'Rarotonga', country: 'CK', airport: 'RAR', name: 'Rarotonga, Cook Islands' },
      { city: 'Pago Pago', country: 'AS', airport: 'PPG', name: 'Pago Pago, American Samoa' },
      { city: 'Honiara', country: 'SB', airport: 'HIR', name: 'Honiara, Solomon Islands' },
      { city: 'Suva', country: 'FJ', airport: 'SUV', name: 'Suva, Fiji' },
      { city: 'Nuku alofa', country: 'TO', airport: 'TBU', name: 'Nukualofa, Tonga' },
      { city: 'Funafuti', country: 'TV', airport: 'FUN', name: 'Funafuti, Tuvalu' },
      { city: 'Tarawa', country: 'KI', airport: 'TRW', name: 'Tarawa, Kiribati' },
      { city: 'Majuro', country: 'MH', airport: 'MAJ', name: 'Majuro, Marshall Islands' },
    ];

    // Schengen countries
    const schengenCountries = ['AT', 'BE', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IS', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'NO', 'PL', 'PT', 'SK', 'SI', 'ES', 'SE', 'CH'];
    const isOriginSchengen = schengenCountries.includes(originCountry);

    // Check visa requirements in parallel
    const recommendationsWithVisa = await Promise.all(
      destinations.map(async (dest) => {
        let visaInfo;
        
        try {
          visaInfo = await visaService.checkVisaRequirement(userCitizenship, dest.country);
        } catch (error) {
          // If API fails, default to visa required
          visaInfo = {
            required: true,
            type: 'Unknown'
          };
        }
        
        // Special Schengen logic: if user is in Schengen, they can travel within Schengen
        if (isOriginSchengen && schengenCountries.includes(dest.country) && userCitizenship !== dest.country) {
          visaInfo = {
            required: false,
            type: 'Schengen Area Travel',
            category: 'visa_free'
          };
        }

        return {
          ...dest,
          visaRequired: visaInfo.required,
          visaType: visaInfo.type || (visaInfo.required ? 'Visa Required' : 'Visa Free'),
        };
      })
    );

    // Filter to visa-free destinations and get top 10
    const visaFreeDestinations = recommendationsWithVisa
      .filter(dest => !dest.visaRequired)
      .slice(0, 10);

    if (visaFreeDestinations.length === 0) {
      return res.json({
        success: true,
        count: 0,
        data: [],
        message: 'No visa-free destinations found. The visa API may be temporarily unavailable.',
      });
    }

    // Get AI descriptions and images for each destination
    const OpenAI = require('openai');
    const axios = require('axios');
    
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const enhancedRecommendations = await Promise.allSettled(
      visaFreeDestinations.map(async (dest) => {
        try {
          // Get AI description
          const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
              {
                role: 'system',
                content: 'You are a travel expert. Write engaging, concise 2-3 sentence descriptions for travel destinations.'
              },
              {
                role: 'user',
                content: `Write a 2-3 sentence personalized description for ${dest.name} as a travel destination for someone traveling from ${origin}. Focus on unique experiences, culture, and why it's worth visiting. Be enthusiastic but authentic.`
              }
            ],
            max_tokens: 100,
            temperature: 0.8,
          });

          const description = completion.choices[0].message.content.trim();

          // Static destination images - 300 cities
          const destinationImages = {
            // Europe
            'Paris, France': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&h=600&fit=crop',
            'London, United Kingdom': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=600&fit=crop',
            'Barcelona, Spain': 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&h=600&fit=crop',
            'Rome, Italy': 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&h=600&fit=crop',
            'Amsterdam, Netherlands': 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800&h=600&fit=crop',
            'Istanbul, Turkey': 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&h=600&fit=crop',
            'Berlin, Germany': 'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=800&h=600&fit=crop',
            'Prague, Czech Republic': 'https://images.unsplash.com/photo-1541849546-216549ae216d?w=800&h=600&fit=crop',
            'Vienna, Austria': 'https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=800&h=600&fit=crop',
            'Lisbon, Portugal': 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800&h=600&fit=crop',
            'Athens, Greece': 'https://images.unsplash.com/photo-1555993539-1732b0258235?w=800&h=600&fit=crop',
            'Budapest, Hungary': 'https://images.unsplash.com/photo-1541725070652-5627965e4ea3?w=800&h=600&fit=crop',
            'Copenhagen, Denmark': 'https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=800&h=600&fit=crop',
            'Madrid, Spain': 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&h=600&fit=crop',
            'Munich, Germany': 'https://images.unsplash.com/photo-1595867818082-083862f3d630?w=800&h=600&fit=crop',
            'Milan, Italy': 'https://images.unsplash.com/photo-1513581166391-887a96ddeafd?w=800&h=600&fit=crop',
            'Dublin, Ireland': 'https://images.unsplash.com/photo-1549918864-48ac978761a4?w=800&h=600&fit=crop',
            'Brussels, Belgium': 'https://images.unsplash.com/photo-1559113202-c916b8e44373?w=800&h=600&fit=crop',
            'Zurich, Switzerland': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
            'Stockholm, Sweden': 'https://images.unsplash.com/photo-1509356843151-3e7d96241e11?w=800&h=600&fit=crop',
            'Warsaw, Poland': 'https://images.unsplash.com/photo-1601823984263-b87b59798b70?w=800&h=600&fit=crop',
            'Oslo, Norway': 'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=800&h=600&fit=crop',
            'Helsinki, Finland': 'https://images.unsplash.com/photo-1565008576549-57569a49371d?w=800&h=600&fit=crop',
            'Edinburgh, United Kingdom': 'https://images.unsplash.com/photo-1549690936-3b0e04171db3?w=800&h=600&fit=crop',
            'Venice, Italy': 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800&h=600&fit=crop',
            'Florence, Italy': 'https://images.unsplash.com/photo-1541967774749-5b4b0e59c2bb?w=800&h=600&fit=crop',
            'Nice, France': 'https://images.unsplash.com/photo-1530452548-b36f41b4e73f?w=800&h=600&fit=crop',
            'Porto, Portugal': 'https://images.unsplash.com/photo-1555881400-69-4ef8893f55?w=800&h=600&fit=crop',
            'Seville, Spain': 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=800&h=600&fit=crop',
            'Valencia, Spain': 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop',
            'Krakow, Poland': 'https://images.unsplash.com/photo-1578894381163-e72c17f2d2f5?w=800&h=600&fit=crop',
            'Reykjavik, Iceland': 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=800&h=600&fit=crop',
            'Luxembourg City, Luxembourg': 'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=800&h=600&fit=crop',
            'Geneva, Switzerland': 'https://images.unsplash.com/photo-1571843890067-29e1c14e97ae?w=800&h=600&fit=crop',
            'Hamburg, Germany': 'https://images.unsplash.com/photo-1558882224-dda166733046?w=800&h=600&fit=crop',
            'Frankfurt, Germany': 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800&h=600&fit=crop',
            'Lyon, France': 'https://images.unsplash.com/photo-1524396309943-e03f5249f002?w=800&h=600&fit=crop',
            'Marseille, France': 'https://images.unsplash.com/photo-1590930297023-64555e93f3e0?w=800&h=600&fit=crop',
            'Manchester, United Kingdom': 'https://images.unsplash.com/photo-1579781403337-c6f6b9c7e207?w=800&h=600&fit=crop',
            'Birmingham, United Kingdom': 'https://images.unsplash.com/photo-1571055107559-3e67626fa8be?w=800&h=600&fit=crop',
            'Naples, Italy': 'https://images.unsplash.com/photo-1543832923-44667a44c804?w=800&h=600&fit=crop',
            'Bologna, Italy': 'https://images.unsplash.com/photo-1588702547919-5dd19f20bde6?w=800&h=600&fit=crop',
            'Dubrovnik, Croatia': 'https://images.unsplash.com/photo-1555990793-da11153b2473?w=800&h=600&fit=crop',
            'Zagreb, Croatia': 'https://images.unsplash.com/photo-1603114072248-204887598e08?w=800&h=600&fit=crop',
            'Split, Croatia': 'https://images.unsplash.com/photo-1558882268-ca259ac5d9b2?w=800&h=600&fit=crop',
            'Bucharest, Romania': 'https://images.unsplash.com/photo-1591348278863-944e-57c2cbf?w=800&h=600&fit=crop',
            'Sofia, Bulgaria': 'https://images.unsplash.com/photo-1565967313396-e08d90920194?w=800&h=600&fit=crop',
            'Belgrade, Serbia': 'https://images.unsplash.com/photo-1579643381606-64913beb1b7d?w=800&h=600&fit=crop',
            'Bratislava, Slovakia': 'https://images.unsplash.com/photo-1573074617613-8f7f6cddc2f0?w=800&h=600&fit=crop',
            'Ljubljana, Slovenia': 'https://images.unsplash.com/photo-1591173791493-d86e8ad5459b?w=800&h=600&fit=crop',
            'Tallinn, Estonia': 'https://images.unsplash.com/photo-1553895501-af9e282e7fc1?w=800&h=600&fit=crop',
            'Riga, Latvia': 'https://images.unsplash.com/photo-1563108625-1e3fd8a71e16?w=800&h=600&fit=crop',
            'Vilnius, Lithuania': 'https://images.unsplash.com/photo-1564906787814-8c1a9dc5e2f4?w=800&h=600&fit=crop',
            'Santorini, Greece': 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&h=600&fit=crop',
            'Mykonos, Greece': 'https://images.unsplash.com/photo-1576485375217-d6a95e34d043?w=800&h=600&fit=crop',
            'Crete, Greece': 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=800&h=600&fit=crop',
            'Rhodes, Greece': 'https://images.unsplash.com/photo-1580837119756-563d608dd119?w=800&h=600&fit=crop',
            'Malta': 'https://images.unsplash.com/photo-1534967783431-93997ce96cd7?w=800&h=600&fit=crop',
            'Palermo, Italy': 'https://images.unsplash.com/photo-1562095241-8c6714fd4178?w=800&h=600&fit=crop',
            'Catania, Italy': 'https://images.unsplash.com/photo-1585155964356-c8f6bdae3142?w=800&h=600&fit=crop',
            'Sardinia, Italy': 'https://images.unsplash.com/photo-1591811012071-4ca9844d9fbb?w=800&h=600&fit=crop',
            'Cologne, Germany': 'https://images.unsplash.com/photo-1577471488278-16eec37ffcc2?w=800&h=600&fit=crop',
            'Dusseldorf, Germany': 'https://images.unsplash.com/photo-1564221710304-0b37c8b9d729?w=800&h=600&fit=crop',
            'Stuttgart, Germany': 'https://images.unsplash.com/photo-1581873372796-dc809aaa3d4b?w=800&h=600&fit=crop',
            'Nuremberg, Germany': 'https://images.unsplash.com/photo-1584646098378-0874589d76b1?w=800&h=600&fit=crop',
            'Dresden, Germany': 'https://images.unsplash.com/photo-1591273022656-999dc798e912?w=800&h=600&fit=crop',
            'Leipzig, Germany': 'https://images.unsplash.com/photo-1609766867946-98fa9a03e066?w=800&h=600&fit=crop',
            'Toulouse, France': 'https://images.unsplash.com/photo-1580674285054-bed31e145f59?w=800&h=600&fit=crop',
            'Bordeaux, France': 'https://images.unsplash.com/photo-1586016836455-cbf3c2af3cb2?w=800&h=600&fit=crop',
            'Nantes, France': 'https://images.unsplash.com/photo-1588421711735-3a84cbf6663d?w=800&h=600&fit=crop',
            'Strasbourg, France': 'https://images.unsplash.com/photo-1584534767618-5e93d0e7db5d?w=800&h=600&fit=crop',
            'Lille, France': 'https://images.unsplash.com/photo-1562183241-b937e95585b6?w=800&h=600&fit=crop',
            'Bilbao, Spain': 'https://images.unsplash.com/photo-1565274531634-bfe5fe97c63f?w=800&h=600&fit=crop',
            'Granada, Spain': 'https://images.unsplash.com/photo-1542842977-2c3f0f60b908?w=800&h=600&fit=crop',
            'Malaga, Spain': 'https://images.unsplash.com/photo-1583241800698-6ca574ce2f49?w=800&h=600&fit=crop',
            'Palma de Mallorca, Spain': 'https://images.unsplash.com/photo-1591178543906-6e4c14f0730c?w=800&h=600&fit=crop',
            'Ibiza, Spain': 'https://images.unsplash.com/photo-1549144511-f099e773c147?w=800&h=600&fit=crop',
            'Alicante, Spain': 'https://images.unsplash.com/photo-1582823984181-c0e5c8e48af7?w=800&h=600&fit=crop',
            'Bergen, Norway': 'https://images.unsplash.com/photo-1552733507-73d552dfc586?w=800&h=600&fit=crop',
            'Tromso, Norway': 'https://images.unsplash.com/photo-1516880711640-ef7db81be3e1?w=800&h=600&fit=crop',
            'Gothenburg, Sweden': 'https://images.unsplash.com/photo-1588429664949-1e1fc8bb85e0?w=800&h=600&fit=crop',
            'Malmo, Sweden': 'https://images.unsplash.com/photo-1580501170888-80668882ca0c?w=800&h=600&fit=crop',
            'Aarhus, Denmark': 'https://images.unsplash.com/photo-1592409804990-2b42e4ab7ec6?w=800&h=600&fit=crop',
            'Billund, Denmark': 'https://images.unsplash.com/photo-1590521302337-03f2e67cc6ca?w=800&h=600&fit=crop',
            'Turku, Finland': 'https://images.unsplash.com/photo-1579617052216-2e84a6f5ddd3?w=800&h=600&fit=crop',
            'Tampere, Finland': 'https://images.unsplash.com/photo-1582786314259-77beed6e5d4e?w=800&h=600&fit=crop',
            'Gdansk, Poland': 'https://images.unsplash.com/photo-1611684838034-ba87b0d1c84a?w=800&h=600&fit=crop',
            'Wroclaw, Poland': 'https://images.unsplash.com/photo-1592496001020-d31bd830651f?w=800&h=600&fit=crop',
            'Poznan, Poland': 'https://images.unsplash.com/photo-1581265046614-a6fb3f1a3f28?w=800&h=600&fit=crop',
            'Thessaloniki, Greece': 'https://images.unsplash.com/photo-1589655955481-8cc22501fea5?w=800&h=600&fit=crop',
            'Corfu, Greece': 'https://images.unsplash.com/photo-1555993539-1732b0258235?w=800&h=600&fit=crop',
            'Zakynthos, Greece': 'https://images.unsplash.com/photo-1584735175097-719d848f8449?w=800&h=600&fit=crop',
            'Faro, Portugal': 'https://images.unsplash.com/photo-1590757934726-41cde29ab53c?w=800&h=600&fit=crop',
            'Funchal, Portugal': 'https://images.unsplash.com/photo-1560198330-f342ef1f2e05?w=800&h=600&fit=crop',
            'Innsbruck, Austria': 'https://images.unsplash.com/photo-1564407443614-e0d7a7419c33?w=800&h=600&fit=crop',
            'Salzburg, Austria': 'https://images.unsplash.com/photo-1542933844-b0e4cceb2df0?w=800&h=600&fit=crop',
            
            // Asia
            'Tokyo, Japan': 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop',
            'Bangkok, Thailand': 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&h=600&fit=crop',
            'Singapore': 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&h=600&fit=crop',
            'Hong Kong': 'https://images.unsplash.com/photo-1536599018102-9f803c140fc1?w=800&h=600&fit=crop',
            'Dubai, UAE': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=600&fit=crop',
            'Bali, Indonesia': 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&h=600&fit=crop',
            'Seoul, South Korea': 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=800&h=600&fit=crop',
            'Phuket, Thailand': 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=800&h=600&fit=crop',
            'Osaka, Japan': 'https://images.unsplash.com/photo-1590253163732-a0c3a0ec0d28?w=800&h=600&fit=crop',
            'Kyoto, Japan': 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&h=600&fit=crop',
            'Jakarta, Indonesia': 'https://images.unsplash.com/photo-1555899434-94d1617b8799?w=800&h=600&fit=crop',
            'Kuala Lumpur, Malaysia': 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800&h=600&fit=crop',
            'Manila, Philippines': 'https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?w=800&h=600&fit=crop',
            'Hanoi, Vietnam': 'https://images.unsplash.com/photo-1555425160-441cb958c5af?w=800&h=600&fit=crop',
            'Ho Chi Minh City, Vietnam': 'https://images.unsplash.com/photo-1583417267826-aebc4d1542e1?w=800&h=600&fit=crop',
            'Taipei, Taiwan': 'https://images.unsplash.com/photo-1559493104-47a9cf90fc3a?w=800&h=600&fit=crop',
            'Shanghai, China': 'https://images.unsplash.com/photo-1474181487882-5abf3f0ba6c2?w=800&h=600&fit=crop',
            'Beijing, China': 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800&h=600&fit=crop',
            'Chiang Mai, Thailand': 'https://images.unsplash.com/photo-1534008897995-27a23e859048?w=800&h=600&fit=crop',
            'Krabi, Thailand': 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800&h=600&fit=crop',
            'Colombo, Sri Lanka': 'https://images.unsplash.com/photo-1584470297122-5c2e53b2bd19?w=800&h=600&fit=crop',
            'New Delhi, India': 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&h=600&fit=crop',
            'Mumbai, India': 'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?w=800&h=600&fit=crop',
            'Bengaluru, India': 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=800&h=600&fit=crop',
            'Chennai, India': 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&h=600&fit=crop',
            'Goa, India': 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&h=600&fit=crop',
            'Jaipur, India': 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800&h=600&fit=crop',
            'Kathmandu, Nepal': 'https://images.unsplash.com/photo-1515967911436-3e7c8d9e1b34?w=800&h=600&fit=crop',
            'Male, Maldives': 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&h=600&fit=crop',
            'Abu Dhabi, UAE': 'https://images.unsplash.com/photo-1512632578888-169bbbc64f33?w=800&h=600&fit=crop',
            'Doha, Qatar': 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop',
            'Muscat, Oman': 'https://images.unsplash.com/photo-1591300659195-ebdef6b0c144?w=800&h=600&fit=crop',
            'Tel Aviv, Israel': 'https://images.unsplash.com/photo-1590764258728-1cf17a1f0cc0?w=800&h=600&fit=crop',
            'Amman, Jordan': 'https://images.unsplash.com/photo-1578153805792-3a5dc2cbe6e4?w=800&h=600&fit=crop',
            'Beirut, Lebanon': 'https://images.unsplash.com/photo-1585233723876-6ca49a52ee14?w=800&h=600&fit=crop',
            'Riyadh, Saudi Arabia': 'https://images.unsplash.com/photo-1576645270438-e6a66e1a1d62?w=800&h=600&fit=crop',
            'Jeddah, Saudi Arabia': 'https://images.unsplash.com/photo-1580836558584-8bcb17f31242?w=800&h=600&fit=crop',
            'Kuwait City, Kuwait': 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&h=600&fit=crop',
            'Manama, Bahrain': 'https://images.unsplash.com/photo-1582736853961-67fad2f8b909?w=800&h=600&fit=crop',
            'Sapporo, Japan': 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&h=600&fit=crop',
            'Fukuoka, Japan': 'https://images.unsplash.com/photo-1590643438263-90f23d90fc96?w=800&h=600&fit=crop',
            'Okinawa, Japan': 'https://images.unsplash.com/photo-1554566398-5d4cdc1a2a36?w=800&h=600&fit=crop',
            'Busan, South Korea': 'https://images.unsplash.com/photo-1561894677-ea41a49b1f9f?w=800&h=600&fit=crop',
            'Jeju, South Korea': 'https://images.unsplash.com/photo-1597050801671-3b8f25bffdf3?w=800&h=600&fit=crop',
            'Cebu, Philippines': 'https://images.unsplash.com/photo-1570789210967-2cac24afeb00?w=800&h=600&fit=crop',
            'Boracay, Philippines': 'https://images.unsplash.com/photo-1584646098378-0874589d76b1?w=800&h=600&fit=crop',
            'Penang, Malaysia': 'https://images.unsplash.com/photo-1591168633644-c47c829dd10e?w=800&h=600&fit=crop',
            'Langkawi, Malaysia': 'https://images.unsplash.com/photo-1519451241324-20b4ea2c4220?w=800&h=600&fit=crop',
            'Kota Kinabalu, Malaysia': 'https://images.unsplash.com/photo-1565008576549-57569a49371d?w=800&h=600&fit=crop',
            'Siem Reap, Cambodia': 'https://images.unsplash.com/photo-1547623542-de3ff5941ddb?w=800&h=600&fit=crop',
            'Phnom Penh, Cambodia': 'https://images.unsplash.com/photo-1580674285054-bed31e145f59?w=800&h=600&fit=crop',
            'Vientiane, Laos': 'https://images.unsplash.com/photo-1584470297122-5c2e53b2bd19?w=800&h=600&fit=crop',
            'Luang Prabang, Laos': 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop',
            'Yangon, Myanmar': 'https://images.unsplash.com/photo-1589655955481-8cc22501fea5?w=800&h=600&fit=crop',
            'Mandalay, Myanmar': 'https://images.unsplash.com/photo-1580501170888-80668882ca0c?w=800&h=600&fit=crop',
            'Dhaka, Bangladesh': 'https://images.unsplash.com/photo-1584534767618-5e93d0e7db5d?w=800&h=600&fit=crop',
            'Guangzhou, China': 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&h=600&fit=crop',
            'Shenzhen, China': 'https://images.unsplash.com/photo-1583241800698-6ca574ce2f49?w=800&h=600&fit=crop',
            'Chengdu, China': 'https://images.unsplash.com/photo-1542842977-2c3f0f60b908?w=800&h=600&fit=crop',
            'Xian, China': 'https://images.unsplash.com/photo-1583417267826-aebc4d1542e1?w=800&h=600&fit=crop',
            'Hangzhou, China': 'https://images.unsplash.com/photo-1591178543906-6e4c14f0730c?w=800&h=600&fit=crop',
            'Nanjing, China': 'https://images.unsplash.com/photo-1549144511-f099e773c147?w=800&h=600&fit=crop',
            'Suzhou, China': 'https://images.unsplash.com/photo-1582823984181-c0e5c8e48af7?w=800&h=600&fit=crop',
            'Macau': 'https://images.unsplash.com/photo-1556827019-e54f0ff7e5d7?w=800&h=600&fit=crop',
            'Ulaanbaatar, Mongolia': 'https://images.unsplash.com/photo-1589655955481-8cc22501fea5?w=800&h=600&fit=crop',
            'Tashkent, Uzbekistan': 'https://images.unsplash.com/photo-1580501170888-80668882ca0c?w=800&h=600&fit=crop',
            'Samarkand, Uzbekistan': 'https://images.unsplash.com/photo-1584646098378-0874589d76b1?w=800&h=600&fit=crop',
            'Tbilisi, Georgia': 'https://images.unsplash.com/photo-1580674285054-bed31e145f59?w=800&h=600&fit=crop',
            'Batumi, Georgia': 'https://images.unsplash.com/photo-1584470297122-5c2e53b2bd19?w=800&h=600&fit=crop',
            'Yerevan, Armenia': 'https://images.unsplash.com/photo-1564221710304-0b37c8b9d729?w=800&h=600&fit=crop',
            'Baku, Azerbaijan': 'https://images.unsplash.com/photo-1581873372796-dc809aaa3d4b?w=800&h=600&fit=crop',
            'Almaty, Kazakhstan': 'https://images.unsplash.com/photo-1584646098378-0874589d76b1?w=800&h=600&fit=crop',
            'Astana, Kazakhstan': 'https://images.unsplash.com/photo-1591273022656-999dc798e912?w=800&h=600&fit=crop',
            'Bishkek, Kyrgyzstan': 'https://images.unsplash.com/photo-1609766867946-98fa9a03e066?w=800&h=600&fit=crop',
            
            // Americas
            'New York, USA': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&h=600&fit=crop',
            'Los Angeles, USA': 'https://images.unsplash.com/photo-1534190239940-9ba8944ea261?w=800&h=600&fit=crop',
            'Miami, USA': 'https://images.unsplash.com/photo-1506966953602-c20cc11f75ee?w=800&h=600&fit=crop',
            'San Francisco, USA': 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&h=600&fit=crop',
            'Las Vegas, USA': 'https://images.unsplash.com/photo-1515859005217-8a1f08870f59?w=800&h=600&fit=crop',
            'Orlando, USA': 'https://images.unsplash.com/photo-1548309965-4333b854d96a?w=800&h=600&fit=crop',
            'Chicago, USA': 'https://images.unsplash.com/photo-1494522855154-9297ac14b55f?w=800&h=600&fit=crop',
            'Seattle, USA': 'https://images.unsplash.com/photo-1542223189-67a03fa0f0bd?w=800&h=600&fit=crop',
            'Boston, USA': 'https://images.unsplash.com/photo-1517156473473-e6af6d5cc613?w=800&h=600&fit=crop',
            'Washington DC, USA': 'https://images.unsplash.com/photo-1557582437-15068f9df43f?w=800&h=600&fit=crop',
            'Atlanta, USA': 'https://images.unsplash.com/photo-1535223289827-42f1e9919769?w=800&h=600&fit=crop',
            'Dallas, USA': 'https://images.unsplash.com/photo-1573490720361-c2a6c90c7a41?w=800&h=600&fit=crop',
            'Houston, USA': 'https://images.unsplash.com/photo-1558442074-3ef25b59bc86?w=800&h=600&fit=crop',
            'Phoenix, USA': 'https://images.unsplash.com/photo-1513405248994-8f05c0c3bb85?w=800&h=600&fit=crop',
            'San Diego, USA': 'https://images.unsplash.com/photo-1583395877020-b33c47c07e5f?w=800&h=600&fit=crop',
            'Denver, USA': 'https://images.unsplash.com/photo-1619856699906-09e1f58c98b1?w=800&h=600&fit=crop',
            'Portland, USA': 'https://images.unsplash.com/photo-1565925743312-a8f8b1f25f7b?w=800&h=600&fit=crop',
            'Austin, USA': 'https://images.unsplash.com/photo-1531218150217-54595bc2b934?w=800&h=600&fit=crop',
            'Nashville, USA': 'https://images.unsplash.com/photo-1457976354623-9a3ba8b4f565?w=800&h=600&fit=crop',
            'New Orleans, USA': 'https://images.unsplash.com/photo-1566404394286-485a188a7889?w=800&h=600&fit=crop',
            'Philadelphia, USA': 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?w=800&h=600&fit=crop',
            'Detroit, USA': 'https://images.unsplash.com/photo-1590759668628-05b0fc34e08a?w=800&h=600&fit=crop',
            'Minneapolis, USA': 'https://images.unsplash.com/photo-1575642651004-6af84b37cb22?w=800&h=600&fit=crop',
            'Honolulu, USA': 'https://images.unsplash.com/photo-1542259009477-d625272157b7?w=800&h=600&fit=crop',
            'Anchorage, USA': 'https://images.unsplash.com/photo-1576085898323-218337e3e43c?w=800&h=600&fit=crop',
            'Toronto, Canada': 'https://images.unsplash.com/photo-1517935706615-2717063c2225?w=800&h=600&fit=crop',
            'Vancouver, Canada': 'https://images.unsplash.com/photo-1559511260-66a654ae982a?w=800&h=600&fit=crop',
            'Montreal, Canada': 'https://images.unsplash.com/photo-1519659613998-ba7082532c1c?w=800&h=600&fit=crop',
            'Calgary, Canada': 'https://images.unsplash.com/photo-1583266437642-da77ce60b0d4?w=800&h=600&fit=crop',
            'Ottawa, Canada': 'https://images.unsplash.com/photo-1562088287-f0e4aa6eb0bb?w=800&h=600&fit=crop',
            'Quebec City, Canada': 'https://images.unsplash.com/photo-1606084676764-d24fa91f04e0?w=800&h=600&fit=crop',
            'Mexico City, Mexico': 'https://images.unsplash.com/photo-1568402102990-bc541580b59f?w=800&h=600&fit=crop',
            'Cancun, Mexico': 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&h=600&fit=crop',
            'Guadalajara, Mexico': 'https://images.unsplash.com/photo-1579567761406-4684ee0c75b6?w=800&h=600&fit=crop',
            'Monterrey, Mexico': 'https://images.unsplash.com/photo-1583415032684-051e71ef6e59?w=800&h=600&fit=crop',
            'Cabo San Lucas, Mexico': 'https://images.unsplash.com/photo-1527631746610-ab99c2dbc6d6?w=800&h=600&fit=crop',
            'Puerto Vallarta, Mexico': 'https://images.unsplash.com/photo-1607014312390-a0e7e6ea3de1?w=800&h=600&fit=crop',
            'Havana, Cuba': 'https://images.unsplash.com/photo-1521735665365-ca78a3423c42?w=800&h=600&fit=crop',
            'San Juan, Puerto Rico': 'https://images.unsplash.com/photo-1580074255770-072b0e6de8bc?w=800&h=600&fit=crop',
            'Punta Cana, Dominican Republic': 'https://images.unsplash.com/photo-1544079276-0efb43e19190?w=800&h=600&fit=crop',
            'Santo Domingo, Dominican Republic': 'https://images.unsplash.com/photo-1544635319-3a5d2e1e3558?w=800&h=600&fit=crop',
            'Kingston, Jamaica': 'https://images.unsplash.com/photo-1569512042993-6dabc63ba3b4?w=800&h=600&fit=crop',
            'Montego Bay, Jamaica': 'https://images.unsplash.com/photo-1604186837056-8e7c2867b6f2?w=800&h=600&fit=crop',
            'Nassau, Bahamas': 'https://images.unsplash.com/photo-1603400521630-9f2de124b33b?w=800&h=600&fit=crop',
            'Bridgetown, Barbados': 'https://images.unsplash.com/photo-1567737145148-59c53f8b4e19?w=800&h=600&fit=crop',
            'Oranjestad, Aruba': 'https://images.unsplash.com/photo-1583241800698-6ca574ce2f49?w=800&h=600&fit=crop',
            'Panama City, Panama': 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop',
            'San Jose, Costa Rica': 'https://images.unsplash.com/photo-1508533848025-9db5f9d9d758?w=800&h=600&fit=crop',
            'Guatemala City, Guatemala': 'https://images.unsplash.com/photo-1566843785717-c624f75c94d7?w=800&h=600&fit=crop',
            'Bogota, Colombia': 'https://images.unsplash.com/photo-1568632234157-ce7aecd03d0d?w=800&h=600&fit=crop',
            'Medellin, Colombia': 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop',
            'Cartagena, Colombia': 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800&h=600&fit=crop',
            'Lima, Peru': 'https://images.unsplash.com/photo-1531968455001-5c5272a41129?w=800&h=600&fit=crop',
            'Cusco, Peru': 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800&h=600&fit=crop',
            'Santiago, Chile': 'https://images.unsplash.com/photo-1583241800698-6ca574ce2f49?w=800&h=600&fit=crop',
            'Buenos Aires, Argentina': 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=800&h=600&fit=crop',
            'Rio de Janeiro, Brazil': 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&h=600&fit=crop',
            'Sao Paulo, Brazil': 'https://images.unsplash.com/photo-1548963670-aaaa8f73a5e3?w=800&h=600&fit=crop',
            'Brasilia, Brazil': 'https://images.unsplash.com/photo-1551803091-e20673f15770?w=800&h=600&fit=crop',
            'Quito, Ecuador': 'https://images.unsplash.com/photo-1563287097-c3e8b00b2f97?w=800&h=600&fit=crop',
            
            // Africa
            'Cairo, Egypt': 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=800&h=600&fit=crop',
            'Marrakech, Morocco': 'https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=800&h=600&fit=crop',
            'Casablanca, Morocco': 'https://images.unsplash.com/photo-1564784799919-7b8e08643c44?w=800&h=600&fit=crop',
            'Cape Town, South Africa': 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800&h=600&fit=crop',
            'Johannesburg, South Africa': 'https://images.unsplash.com/photo-1577948000111-9c970dfe3743?w=800&h=600&fit=crop',
            'Durban, South Africa': 'https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?w=800&h=600&fit=crop',
            'Nairobi, Kenya': 'https://images.unsplash.com/photo-1611348524140-53c9a25263d6?w=800&h=600&fit=crop',
            'Mombasa, Kenya': 'https://images.unsplash.com/photo-1565118531796-763e5082d113?w=800&h=600&fit=crop',
            'Zanzibar, Tanzania': 'https://images.unsplash.com/photo-1563299796-17596ed6b017?w=800&h=600&fit=crop',
            'Dar es Salaam, Tanzania': 'https://images.unsplash.com/photo-1590764258728-1cf17a1f0cc0?w=800&h=600&fit=crop',
            'Addis Ababa, Ethiopia': 'https://images.unsplash.com/photo-1594048719842-d3b80a2e46ca?w=800&h=600&fit=crop',
            'Lagos, Nigeria': 'https://images.unsplash.com/photo-1614018215801-a5a4f0f15e47?w=800&h=600&fit=crop',
            'Abuja, Nigeria': 'https://images.unsplash.com/photo-1584534767618-5e93d0e7db5d?w=800&h=600&fit=crop',
            'Accra, Ghana': 'https://images.unsplash.com/photo-1583241800698-6ca574ce2f49?w=800&h=600&fit=crop',
            'Dakar, Senegal': 'https://images.unsplash.com/photo-1604223190546-0f33e00e28d4?w=800&h=600&fit=crop',
            'Tunis, Tunisia': 'https://images.unsplash.com/photo-1564221710304-0b37c8b9d729?w=800&h=600&fit=crop',
            'Algiers, Algeria': 'https://images.unsplash.com/photo-1581873372796-dc809aaa3d4b?w=800&h=600&fit=crop',
            'Sharm El Sheikh, Egypt': 'https://images.unsplash.com/photo-1551918120-9739cb430c6d?w=800&h=600&fit=crop',
            'Hurghada, Egypt': 'https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=800&h=600&fit=crop',
            'Luxor, Egypt': 'https://images.unsplash.com/photo-1553913861-c0fddf2619ee?w=800&h=600&fit=crop',
            'Port Louis, Mauritius': 'https://images.unsplash.com/photo-1562737999-e97f7c0ca5b5?w=800&h=600&fit=crop',
            'Mahe, Seychelles': 'https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=800&h=600&fit=crop',
            'Kigali, Rwanda': 'https://images.unsplash.com/photo-1598524722820-acbb7f36e4be?w=800&h=600&fit=crop',
            'Kampala, Uganda': 'https://images.unsplash.com/photo-1584646098378-0874589d76b1?w=800&h=600&fit=crop',
            'Windhoek, Namibia': 'https://images.unsplash.com/photo-1580674285054-bed31e145f59?w=800&h=600&fit=crop',
            'Luanda, Angola': 'https://images.unsplash.com/photo-1584470297122-5c2e53b2bd19?w=800&h=600&fit=crop',
            'Maputo, Mozambique': 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop',
            'Lusaka, Zambia': 'https://images.unsplash.com/photo-1583241800698-6ca574ce2f49?w=800&h=600&fit=crop',
            'Harare, Zimbabwe': 'https://images.unsplash.com/photo-1564221710304-0b37c8b9d729?w=800&h=600&fit=crop',
            'Victoria Falls, Zimbabwe': 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800&h=600&fit=crop',
            
            // Oceania
            'Sydney, Australia': 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&h=600&fit=crop',
            'Melbourne, Australia': 'https://images.unsplash.com/photo-1514395462725-fb4566210144?w=800&h=600&fit=crop',
            'Brisbane, Australia': 'https://images.unsplash.com/photo-1523671259633-4683ab41d6fb?w=800&h=600&fit=crop',
            'Perth, Australia': 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&h=600&fit=crop',
            'Adelaide, Australia': 'https://images.unsplash.com/photo-1548029173-59c9fc4e7326?w=800&h=600&fit=crop',
            'Gold Coast, Australia': 'https://images.unsplash.com/photo-1590759668628-05b0fc34e08a?w=800&h=600&fit=crop',
            'Cairns, Australia': 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop',
            'Hobart, Australia': 'https://images.unsplash.com/photo-1575642651004-6af84b37cb22?w=800&h=600&fit=crop',
            'Darwin, Australia': 'https://images.unsplash.com/photo-1576085898323-218337e3e43c?w=800&h=600&fit=crop',
            'Canberra, Australia': 'https://images.unsplash.com/photo-1583241800698-6ca574ce2f49?w=800&h=600&fit=crop',
            'Auckland, New Zealand': 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=800&h=600&fit=crop',
            'Wellington, New Zealand': 'https://images.unsplash.com/photo-1522716348105-02dc91f39e81?w=800&h=600&fit=crop',
            'Christchurch, New Zealand': 'https://images.unsplash.com/photo-1588665362961-0c6f0e96a45b?w=800&h=600&fit=crop',
            'Queenstown, New Zealand': 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=800&h=600&fit=crop',
            'Dunedin, New Zealand': 'https://images.unsplash.com/photo-1522716348105-02dc91f39e81?w=800&h=600&fit=crop',
            'Nadi, Fiji': 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&h=600&fit=crop',
            'Papeete, Tahiti': 'https://images.unsplash.com/photo-1589655955481-8cc22501fea5?w=800&h=600&fit=crop',
            'Bora Bora, French Polynesia': 'https://images.unsplash.com/photo-1580501170888-80668882ca0c?w=800&h=600&fit=crop',
            'Port Vila, Vanuatu': 'https://images.unsplash.com/photo-1584646098378-0874589d76b1?w=800&h=600&fit=crop',
            'Noumea, New Caledonia': 'https://images.unsplash.com/photo-1580674285054-bed31e145f59?w=800&h=600&fit=crop',
            'Port Moresby, Papua New Guinea': 'https://images.unsplash.com/photo-1584470297122-5c2e53b2bd19?w=800&h=600&fit=crop',
            'Apia, Samoa': 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop',
            'Rarotonga, Cook Islands': 'https://images.unsplash.com/photo-1583241800698-6ca574ce2f49?w=800&h=600&fit=crop',
            'Pago Pago, American Samoa': 'https://images.unsplash.com/photo-1564221710304-0b37c8b9d729?w=800&h=600&fit=crop',
            'Honiara, Solomon Islands': 'https://images.unsplash.com/photo-1581873372796-dc809aaa3d4b?w=800&h=600&fit=crop',
            'Suva, Fiji': 'https://images.unsplash.com/photo-1584646098378-0874589d76b1?w=800&h=600&fit=crop',
            'Nukualofa, Tonga': 'https://images.unsplash.com/photo-1591273022656-999dc798e912?w=800&h=600&fit=crop',
            'Funafuti, Tuvalu': 'https://images.unsplash.com/photo-1609766867946-98fa9a03e066?w=800&h=600&fit=crop',
            'Tarawa, Kiribati': 'https://images.unsplash.com/photo-1580674285054-bed31e145f59?w=800&h=600&fit=crop',
            'Majuro, Marshall Islands': 'https://images.unsplash.com/photo-1584470297122-5c2e53b2bd19?w=800&h=600&fit=crop',
          };

          const imageUrl = destinationImages[dest.name] || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=600&fit=crop';

          return {
            destination: dest.name,
            city: dest.city,
            country: dest.country,
            airport: dest.airport,
            visaRequired: dest.visaRequired,
            visaType: dest.visaType === 'Visa Free' || !dest.visaRequired ? 'Visa Free' : dest.visaType,
            description,
            imageUrl,
          };
        } catch (error) {
          console.error(`Failed to enhance ${dest.name}:`, error.message);
          // Return basic info if AI/image fails
          return {
            destination: dest.name,
            city: dest.city,
            country: dest.country,
            airport: dest.airport,
            visaRequired: dest.visaRequired,
            visaType: dest.visaType === 'Visa Free' || !dest.visaRequired ? 'Visa Free' : dest.visaType,
            description: `${dest.name} is a wonderful destination known for its culture, cuisine, and unique experiences.`,
            imageUrl: `https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=600&fit=crop&q=80`,
          };
        }
      })
    );

    // Filter successful results
    const successfulRecommendations = enhancedRecommendations
      .filter(result => result.status === 'fulfilled')
      .map(result => result.value);

    return res.json({
      success: true,
      count: successfulRecommendations.length,
      data: successfulRecommendations,
      origin,
      citizenship: userCitizenship,
      schengenTravel: isOriginSchengen,
    });

    res.json({
      success: true,
      count: recommendations.length,
      data: recommendations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Save flight to favorites
// @route   POST /api/flights/save
// @access  Private
exports.saveFlight = async (req, res) => {
  try {
    const flightData = req.body;

    // Validate required fields
    if (!flightData.origin || !flightData.destination || !flightData.departureDate) {
      return res.status(400).json({
        success: false,
        error: 'Missing required flight information',
      });
    }

    // Check if flight already exists for this user
    const existingFlight = await Flight.findOne({
      externalId: flightData.externalId,
    });

    let flight;
    if (existingFlight) {
      flight = existingFlight;
    } else {
      // Create flight document with proper date parsing
      flight = await Flight.create({
        ...flightData,
        departureDate: new Date(flightData.departureDate),
        returnDate: flightData.returnDate ? new Date(flightData.returnDate) : null,
      });
    }

    // Check if already saved by user
    const user = await User.findById(req.user.id);
    const alreadySaved = user.savedFlights.some(
      savedId => savedId.toString() === flight._id.toString()
    );

    if (!alreadySaved) {
      // Add to user's saved flights
      await User.findByIdAndUpdate(req.user.id, {
        $push: { savedFlights: flight._id },
      });
    }

    res.json({
      success: true,
      data: flight,
      message: alreadySaved ? 'Flight already in favorites' : 'Flight saved successfully',
    });
  } catch (error) {
    console.error('Save flight error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to save flight',
    });
  }
};

// @desc    Check visa requirement for destination
// @route   GET /api/flights/visa-check
// @access  Private
exports.checkVisaRequirement = async (req, res) => {
  try {
    const { destination } = req.query;
    const user = await User.findById(req.user.id);

    if (!destination) {
      return res.status(400).json({
        success: false,
        error: 'Please provide destination country code',
      });
    }

    const visaInfo = visaService.checkVisaRequirement(
      user.citizenship,
      destination
    );

    res.json({
      success: true,
      data: visaInfo,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Search locations (airports/cities)
// @route   GET /api/flights/locations
// @access  Public
exports.searchLocations = async (req, res) => {
  try {
    const { keyword } = req.query;

    if (!keyword) {
      return res.status(400).json({
        success: false,
        error: 'Please provide search keyword',
      });
    }

    const locations = await amadeusService.searchLocations(keyword);

    res.json({
      success: true,
      data: locations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Get visa-free destinations with cheapest flights
// @route   GET /api/flights/visa-free-destinations
// @access  Private
exports.getVisaFreeDestinations = async (req, res) => {
  try {
    const { origin, departureDate, returnDate, adults, travelClass } = req.query;

    if (!origin || !departureDate) {
      return res.status(400).json({
        success: false,
        error: 'Please provide origin and departure date',
      });
    }

    const user = await User.findById(req.user.id);
    const citizenship = user.citizenship;

    // List of major destination airport codes
    const popularDestinations = [
      'LHR', 'CDG', 'AMS', 'FRA', 'MAD', 'BCN', 'FCO', 'VCE', 'ATH', 'IST',
      'DXB', 'DOH', 'SIN', 'HKG', 'NRT', 'ICN', 'BKK', 'KUL', 'DEL', 'BOM',
      'JFK', 'LAX', 'MIA', 'ORD', 'YYZ', 'MEX', 'GRU', 'EZE', 'SCL', 'BOG',
      'SYD', 'MEL', 'AKL', 'JNB', 'CPT', 'CAI', 'NBO', 'ADD', 'DUR', 'CMN'
    ];

    // Get visa requirements for all destinations in parallel
    const visaChecks = await Promise.all(
      popularDestinations.map(async (dest) => {
        try {
          const countryCode = getCountryFromAirport(dest);
          const visaInfo = await visaService.checkVisaRequirement(citizenship, countryCode);
          return { airport: dest, countryCode, visaRequired: visaInfo.required };
        } catch (error) {
          return { airport: dest, visaRequired: true };
        }
      })
    );

    // Filter to only visa-free destinations
    const visaFreeAirports = visaChecks
      .filter(check => !check.visaRequired)
      .map(check => check.airport);

    if (visaFreeAirports.length === 0) {
      return res.json({
        success: true,
        count: 0,
        data: [],
        message: 'No visa-free destinations found',
      });
    }

    // Search flights for each visa-free destination (limit to 20 to avoid timeout)
    const flightSearches = await Promise.allSettled(
      visaFreeAirports.slice(0, 30).map(async (destination) => {
        try {
          const flights = await amadeusService.searchFlights({
            origin,
            destination,
            departureDate,
            returnDate,
            adults: adults || 1,
            travelClass: travelClass || 'ECONOMY',
          });
          return flights[0]; // Get cheapest flight
        } catch (error) {
          return null;
        }
      })
    );

    // Filter successful results and sort by price
    const validFlights = flightSearches
      .filter(result => result.status === 'fulfilled' && result.value)
      .map(result => result.value)
      .sort((a, b) => parseFloat(a.price?.total || 999999) - parseFloat(b.price?.total || 999999))
      .slice(0, 20); // Return top 20 cheapest

    res.json({
      success: true,
      count: validFlights.length,
      data: validFlights,
      citizenship: citizenship,
    });
  } catch (error) {
    console.error('Visa-free destinations error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Helper function to map airports to country codes
function getCountryFromAirport(airportCode) {
  const airportToCountry = {
    // Europe
    'LHR': 'GB', 'LGW': 'GB', 'MAN': 'GB', 'EDI': 'GB',
    'CDG': 'FR', 'ORY': 'FR', 'NCE': 'FR', 'LYS': 'FR',
    'AMS': 'NL', 'RTM': 'NL',
    'FRA': 'DE', 'MUC': 'DE', 'TXL': 'DE', 'DUS': 'DE',
    'MAD': 'ES', 'BCN': 'ES', 'AGP': 'ES', 'PMI': 'ES',
    'FCO': 'IT', 'MXP': 'IT', 'VCE': 'IT', 'NAP': 'IT',
    'ATH': 'GR', 'HER': 'GR',
    'IST': 'TR', 'SAW': 'TR', 'AYT': 'TR',
    'VIE': 'AT', 'ZRH': 'CH', 'GVA': 'CH',
    'BRU': 'BE', 'DUB': 'IE', 'LIS': 'PT', 'OPO': 'PT',
    // Middle East
    'DXB': 'AE', 'AUH': 'AE', 'DOH': 'QA', 'RUH': 'SA', 'JED': 'SA',
    // Asia
    'SIN': 'SG', 'HKG': 'HK', 'NRT': 'JP', 'HND': 'JP', 'KIX': 'JP',
    'ICN': 'KR', 'PVG': 'CN', 'PEK': 'CN', 'CAN': 'CN',
    'BKK': 'TH', 'DMK': 'TH', 'KUL': 'MY', 'CGK': 'ID',
    'DEL': 'IN', 'BOM': 'IN', 'BLR': 'IN',
    // Americas
    'JFK': 'US', 'LAX': 'US', 'MIA': 'US', 'ORD': 'US', 'SFO': 'US',
    'YYZ': 'CA', 'YVR': 'CA', 'YUL': 'CA',
    'MEX': 'MX', 'CUN': 'MX',
    'GRU': 'BR', 'GIG': 'BR', 'EZE': 'AR', 'SCL': 'CL', 'BOG': 'CO',
    // Oceania
    'SYD': 'AU', 'MEL': 'AU', 'BNE': 'AU', 'AKL': 'NZ',
    // Africa
    'JNB': 'ZA', 'CPT': 'ZA', 'CAI': 'EG', 'NBO': 'KE', 'ADD': 'ET', 'DUR': 'ZA', 'CMN': 'MA',
  };
  return airportToCountry[airportCode] || airportCode.substring(0, 2);
}
