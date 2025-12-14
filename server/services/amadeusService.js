const AmadeusClient = require('./amadeusClient');

// Initialize custom Amadeus client
console.log('Amadeus Configuration:');
console.log('API Key:', process.env.AMADEUS_API_KEY ? 'SET' : 'NOT SET');
console.log('API Secret:', process.env.AMADEUS_API_SECRET ? 'SET' : 'NOT SET');
console.log('Using Custom Amadeus Client (bypassing buggy library)');

const amadeusClient = new AmadeusClient(
  process.env.AMADEUS_API_KEY,
  process.env.AMADEUS_API_SECRET
);

// Search for flights
exports.searchFlights = async (params) => {
  try {
    console.log('🔍 Searching flights via Amadeus API...');
    const flights = await amadeusClient.searchFlights(params);
    console.log(`✅ Found ${flights.length} real flights from Amadeus API`);
    return flights;
  } catch (error) {
    console.error('❌ Amadeus API Error:', error.message);
    
    // Return mock data for development if API fails
    console.log('⚠️ Returning mock flight data for development');
    return generateMockFlights(params);
  }
};

// Generate mock flight data for development
const generateMockFlights = (params) => {
  const airlines = ['AA', 'UA', 'DL', 'BA', 'LH', 'AF', 'KL', 'TK'];
  const hubs = ['IST', 'FRA', 'AMS', 'CDG', 'LHR', 'DXB', 'DOH', 'MUC'];
  const mockFlights = [];
  
  for (let i = 0; i < 10; i++) {
    const hasLayover = i % 3 !== 0; // 2 out of 3 flights have layovers
    const numberOfStops = hasLayover ? (i % 4 === 0 ? 2 : 1) : 0;
    
    let segments = [];
    let currentTime = new Date(`${params.departureDate}T${String(6 + i).padStart(2, '0')}:00:00`);
    let totalDuration = 0;
    
    if (numberOfStops === 0) {
      // Direct flight
      const flightDuration = 2 + Math.random() * 4; // 2-6 hours
      totalDuration = flightDuration;
      const arrivalTime = new Date(currentTime.getTime() + flightDuration * 60 * 60 * 1000);
      
      segments.push({
        departure: {
          iataCode: params.origin,
          at: currentTime.toISOString()
        },
        arrival: {
          iataCode: params.destination,
          at: arrivalTime.toISOString()
        },
        carrierCode: airlines[i % airlines.length],
        number: String(1000 + i),
        aircraft: { code: '320' },
        duration: `PT${Math.floor(flightDuration)}H${Math.floor((flightDuration % 1) * 60)}M`,
        numberOfStops: 0
      });
    } else {
      // Flight with layovers
      for (let stop = 0; stop <= numberOfStops; stop++) {
        const isFirstSegment = stop === 0;
        const isLastSegment = stop === numberOfStops;
        
        const origin = isFirstSegment ? params.origin : hubs[Math.floor(Math.random() * hubs.length)];
        const destination = isLastSegment ? params.destination : hubs[Math.floor(Math.random() * hubs.length)];
        
        const segmentDuration = 1.5 + Math.random() * 3; // 1.5-4.5 hours per segment
        totalDuration += segmentDuration;
        
        const arrivalTime = new Date(currentTime.getTime() + segmentDuration * 60 * 60 * 1000);
        
        segments.push({
          departure: {
            iataCode: origin,
            at: currentTime.toISOString()
          },
          arrival: {
            iataCode: destination,
            at: arrivalTime.toISOString()
          },
          carrierCode: airlines[i % airlines.length],
          number: String(1000 + i + stop),
          aircraft: { code: '320' },
          duration: `PT${Math.floor(segmentDuration)}H${Math.floor((segmentDuration % 1) * 60)}M`,
          numberOfStops: 0
        });
        
        // Add layover time if not the last segment
        if (!isLastSegment) {
          const layoverDuration = 1 + Math.random() * 3; // 1-4 hours layover
          totalDuration += layoverDuration;
          currentTime = new Date(arrivalTime.getTime() + layoverDuration * 60 * 60 * 1000);
        }
      }
    }
    
    const basePrice = 200 + Math.random() * 800 + (numberOfStops * 50); // More stops = slightly cheaper
    const totalDurationString = `PT${Math.floor(totalDuration)}H${Math.floor((totalDuration % 1) * 60)}M`;
    
    // Generate return flight if it's a round trip
    let itineraries = [{
      duration: totalDurationString,
      segments: segments
    }];
    
    if (params.returnDate) {
      const returnHasLayover = (i + 1) % 3 !== 0;
      const returnStops = returnHasLayover ? (i % 4 === 0 ? 2 : 1) : 0;
      let returnSegments = [];
      let returnCurrentTime = new Date(`${params.returnDate}T${String(10 + i).padStart(2, '0')}:00:00`);
      let returnTotalDuration = 0;
      
      if (returnStops === 0) {
        // Direct return flight
        const flightDuration = 2 + Math.random() * 4;
        returnTotalDuration = flightDuration;
        const arrivalTime = new Date(returnCurrentTime.getTime() + flightDuration * 60 * 60 * 1000);
        
        returnSegments.push({
          departure: {
            iataCode: params.destination,
            at: returnCurrentTime.toISOString()
          },
          arrival: {
            iataCode: params.origin,
            at: arrivalTime.toISOString()
          },
          carrierCode: airlines[i % airlines.length],
          number: String(2000 + i),
          aircraft: { code: '320' },
          duration: `PT${Math.floor(flightDuration)}H${Math.floor((flightDuration % 1) * 60)}M`,
          numberOfStops: 0
        });
      } else {
        // Return flight with layovers
        for (let stop = 0; stop <= returnStops; stop++) {
          const isFirstSegment = stop === 0;
          const isLastSegment = stop === returnStops;
          
          const origin = isFirstSegment ? params.destination : hubs[Math.floor(Math.random() * hubs.length)];
          const destination = isLastSegment ? params.origin : hubs[Math.floor(Math.random() * hubs.length)];
          
          const segmentDuration = 1.5 + Math.random() * 3;
          returnTotalDuration += segmentDuration;
          
          const arrivalTime = new Date(returnCurrentTime.getTime() + segmentDuration * 60 * 60 * 1000);
          
          returnSegments.push({
            departure: {
              iataCode: origin,
              at: returnCurrentTime.toISOString()
            },
            arrival: {
              iataCode: destination,
              at: arrivalTime.toISOString()
            },
            carrierCode: airlines[i % airlines.length],
            number: String(2000 + i + stop),
            aircraft: { code: '320' },
            duration: `PT${Math.floor(segmentDuration)}H${Math.floor((segmentDuration % 1) * 60)}M`,
            numberOfStops: 0
          });
          
          if (!isLastSegment) {
            const layoverDuration = 1 + Math.random() * 3;
            returnTotalDuration += layoverDuration;
            returnCurrentTime = new Date(arrivalTime.getTime() + layoverDuration * 60 * 60 * 1000);
          }
        }
      }
      
      const returnDurationString = `PT${Math.floor(returnTotalDuration)}H${Math.floor((returnTotalDuration % 1) * 60)}M`;
      itineraries.push({
        duration: returnDurationString,
        segments: returnSegments
      });
    }
    
    mockFlights.push({
      type: 'flight-offer',
      id: `MOCK_${i}`,
      source: 'GDS',
      instantTicketingRequired: false,
      nonHomogeneous: false,
      oneWay: !params.returnDate,
      lastTicketingDate: params.departureDate,
      numberOfBookableSeats: Math.floor(1 + Math.random() * 9),
      itineraries: itineraries,
      price: {
        currency: 'USD',
        total: basePrice.toFixed(2),
        base: (basePrice * 0.85).toFixed(2),
        fees: [{
          amount: (basePrice * 0.15).toFixed(2),
          type: 'TICKETING'
        }],
        grandTotal: basePrice.toFixed(2)
      },
      pricingOptions: {
        fareType: ['PUBLISHED'],
        includedCheckedBagsOnly: true
      },
      validatingAirlineCodes: [airlines[i % airlines.length]],
      travelerPricings: [{
        travelerId: '1',
        fareOption: 'STANDARD',
        travelerType: 'ADULT',
        price: {
          currency: 'USD',
          total: basePrice.toFixed(2),
          base: (basePrice * 0.85).toFixed(2)
        }
      }]
    });
  }
  
  return mockFlights;
};

// Get flight price analysis - not available in free tier, return null
exports.getFlightPriceAnalysis = async (origin, destination) => {
  console.log('ℹ️ Price analysis requires paid Amadeus tier');
  return null;
};

// Get airport and city search
exports.searchLocations = async (keyword) => {
  try {
    console.log(`🔍 Searching locations for: ${keyword}`);
    const locations = await amadeusClient.searchLocations(keyword);
    console.log(`✅ Found ${locations.length} real locations from Amadeus API`);
    return locations;
  } catch (error) {
    console.error('❌ Location Search Error:', error.message);
    
    // Return mock location data for development
    console.log('⚠️ Returning mock location data for development');
    return generateMockLocations(keyword);
  }
};

// Generate mock location data for development - Comprehensive European & Turkish airports
const generateMockLocations = (keyword) => {
  // Complete airport database for Europe and Turkey
  const allAirports = [
    // Turkey
    { id: 'IST', type: 'location', subType: 'AIRPORT', name: 'Istanbul Airport', iataCode: 'IST', address: { cityName: 'Istanbul', countryName: 'Turkey' } },
    { id: 'SAW', type: 'location', subType: 'AIRPORT', name: 'Sabiha Gokcen International Airport', iataCode: 'SAW', address: { cityName: 'Istanbul', countryName: 'Turkey' } },
    { id: 'AYT', type: 'location', subType: 'AIRPORT', name: 'Antalya Airport', iataCode: 'AYT', address: { cityName: 'Antalya', countryName: 'Turkey' } },
    { id: 'ESB', type: 'location', subType: 'AIRPORT', name: 'Esenboga Airport', iataCode: 'ESB', address: { cityName: 'Ankara', countryName: 'Turkey' } },
    { id: 'ADB', type: 'location', subType: 'AIRPORT', name: 'Adnan Menderes Airport', iataCode: 'ADB', address: { cityName: 'Izmir', countryName: 'Turkey' } },
    { id: 'DLM', type: 'location', subType: 'AIRPORT', name: 'Dalaman Airport', iataCode: 'DLM', address: { cityName: 'Dalaman', countryName: 'Turkey' } },
    { id: 'BJV', type: 'location', subType: 'AIRPORT', name: 'Bodrum Airport', iataCode: 'BJV', address: { cityName: 'Bodrum', countryName: 'Turkey' } },
    { id: 'GZT', type: 'location', subType: 'AIRPORT', name: 'Gaziantep Airport', iataCode: 'GZT', address: { cityName: 'Gaziantep', countryName: 'Turkey' } },
    { id: 'TZX', type: 'location', subType: 'AIRPORT', name: 'Trabzon Airport', iataCode: 'TZX', address: { cityName: 'Trabzon', countryName: 'Turkey' } },
    
    // United Kingdom
    { id: 'LHR', type: 'location', subType: 'AIRPORT', name: 'London Heathrow Airport', iataCode: 'LHR', address: { cityName: 'London', countryName: 'United Kingdom' } },
    { id: 'LGW', type: 'location', subType: 'AIRPORT', name: 'London Gatwick Airport', iataCode: 'LGW', address: { cityName: 'London', countryName: 'United Kingdom' } },
    { id: 'LCY', type: 'location', subType: 'AIRPORT', name: 'London City Airport', iataCode: 'LCY', address: { cityName: 'London', countryName: 'United Kingdom' } },
    { id: 'STN', type: 'location', subType: 'AIRPORT', name: 'London Stansted Airport', iataCode: 'STN', address: { cityName: 'London', countryName: 'United Kingdom' } },
    { id: 'LTN', type: 'location', subType: 'AIRPORT', name: 'London Luton Airport', iataCode: 'LTN', address: { cityName: 'London', countryName: 'United Kingdom' } },
    { id: 'MAN', type: 'location', subType: 'AIRPORT', name: 'Manchester Airport', iataCode: 'MAN', address: { cityName: 'Manchester', countryName: 'United Kingdom' } },
    { id: 'EDI', type: 'location', subType: 'AIRPORT', name: 'Edinburgh Airport', iataCode: 'EDI', address: { cityName: 'Edinburgh', countryName: 'United Kingdom' } },
    { id: 'BHX', type: 'location', subType: 'AIRPORT', name: 'Birmingham Airport', iataCode: 'BHX', address: { cityName: 'Birmingham', countryName: 'United Kingdom' } },
    
    // France
    { id: 'CDG', type: 'location', subType: 'AIRPORT', name: 'Charles de Gaulle Airport', iataCode: 'CDG', address: { cityName: 'Paris', countryName: 'France' } },
    { id: 'ORY', type: 'location', subType: 'AIRPORT', name: 'Orly Airport', iataCode: 'ORY', address: { cityName: 'Paris', countryName: 'France' } },
    { id: 'NCE', type: 'location', subType: 'AIRPORT', name: 'Nice Cote d\'Azur Airport', iataCode: 'NCE', address: { cityName: 'Nice', countryName: 'France' } },
    { id: 'LYS', type: 'location', subType: 'AIRPORT', name: 'Lyon-Saint Exupery Airport', iataCode: 'LYS', address: { cityName: 'Lyon', countryName: 'France' } },
    { id: 'MRS', type: 'location', subType: 'AIRPORT', name: 'Marseille Provence Airport', iataCode: 'MRS', address: { cityName: 'Marseille', countryName: 'France' } },
    
    // Germany
    { id: 'FRA', type: 'location', subType: 'AIRPORT', name: 'Frankfurt Airport', iataCode: 'FRA', address: { cityName: 'Frankfurt', countryName: 'Germany' } },
    { id: 'MUC', type: 'location', subType: 'AIRPORT', name: 'Munich Airport', iataCode: 'MUC', address: { cityName: 'Munich', countryName: 'Germany' } },
    { id: 'BER', type: 'location', subType: 'AIRPORT', name: 'Berlin Brandenburg Airport', iataCode: 'BER', address: { cityName: 'Berlin', countryName: 'Germany' } },
    { id: 'DUS', type: 'location', subType: 'AIRPORT', name: 'Dusseldorf Airport', iataCode: 'DUS', address: { cityName: 'Dusseldorf', countryName: 'Germany' } },
    { id: 'HAM', type: 'location', subType: 'AIRPORT', name: 'Hamburg Airport', iataCode: 'HAM', address: { cityName: 'Hamburg', countryName: 'Germany' } },
    
    // Spain
    { id: 'MAD', type: 'location', subType: 'AIRPORT', name: 'Adolfo Suarez Madrid-Barajas Airport', iataCode: 'MAD', address: { cityName: 'Madrid', countryName: 'Spain' } },
    { id: 'BCN', type: 'location', subType: 'AIRPORT', name: 'Barcelona-El Prat Airport', iataCode: 'BCN', address: { cityName: 'Barcelona', countryName: 'Spain' } },
    { id: 'AGP', type: 'location', subType: 'AIRPORT', name: 'Malaga-Costa del Sol Airport', iataCode: 'AGP', address: { cityName: 'Malaga', countryName: 'Spain' } },
    { id: 'PMI', type: 'location', subType: 'AIRPORT', name: 'Palma de Mallorca Airport', iataCode: 'PMI', address: { cityName: 'Palma', countryName: 'Spain' } },
    { id: 'VLC', type: 'location', subType: 'AIRPORT', name: 'Valencia Airport', iataCode: 'VLC', address: { cityName: 'Valencia', countryName: 'Spain' } },
    
    // Italy
    { id: 'FCO', type: 'location', subType: 'AIRPORT', name: 'Leonardo da Vinci-Fiumicino Airport', iataCode: 'FCO', address: { cityName: 'Rome', countryName: 'Italy' } },
    { id: 'MXP', type: 'location', subType: 'AIRPORT', name: 'Milan Malpensa Airport', iataCode: 'MXP', address: { cityName: 'Milan', countryName: 'Italy' } },
    { id: 'LIN', type: 'location', subType: 'AIRPORT', name: 'Milan Linate Airport', iataCode: 'LIN', address: { cityName: 'Milan', countryName: 'Italy' } },
    { id: 'VCE', type: 'location', subType: 'AIRPORT', name: 'Venice Marco Polo Airport', iataCode: 'VCE', address: { cityName: 'Venice', countryName: 'Italy' } },
    { id: 'NAP', type: 'location', subType: 'AIRPORT', name: 'Naples International Airport', iataCode: 'NAP', address: { cityName: 'Naples', countryName: 'Italy' } },
    
    // Netherlands
    { id: 'AMS', type: 'location', subType: 'AIRPORT', name: 'Amsterdam Schiphol Airport', iataCode: 'AMS', address: { cityName: 'Amsterdam', countryName: 'Netherlands' } },
    
    // Greece
    { id: 'ATH', type: 'location', subType: 'AIRPORT', name: 'Athens International Airport', iataCode: 'ATH', address: { cityName: 'Athens', countryName: 'Greece' } },
    { id: 'HER', type: 'location', subType: 'AIRPORT', name: 'Heraklion International Airport', iataCode: 'HER', address: { cityName: 'Heraklion', countryName: 'Greece' } },
    { id: 'RHO', type: 'location', subType: 'AIRPORT', name: 'Rhodes International Airport', iataCode: 'RHO', address: { cityName: 'Rhodes', countryName: 'Greece' } },
    
    // Switzerland
    { id: 'ZRH', type: 'location', subType: 'AIRPORT', name: 'Zurich Airport', iataCode: 'ZRH', address: { cityName: 'Zurich', countryName: 'Switzerland' } },
    { id: 'GVA', type: 'location', subType: 'AIRPORT', name: 'Geneva Airport', iataCode: 'GVA', address: { cityName: 'Geneva', countryName: 'Switzerland' } },
    
    // Austria
    { id: 'VIE', type: 'location', subType: 'AIRPORT', name: 'Vienna International Airport', iataCode: 'VIE', address: { cityName: 'Vienna', countryName: 'Austria' } },
    
    // Belgium
    { id: 'BRU', type: 'location', subType: 'AIRPORT', name: 'Brussels Airport', iataCode: 'BRU', address: { cityName: 'Brussels', countryName: 'Belgium' } },
    
    // Portugal
    { id: 'LIS', type: 'location', subType: 'AIRPORT', name: 'Lisbon Portela Airport', iataCode: 'LIS', address: { cityName: 'Lisbon', countryName: 'Portugal' } },
    { id: 'OPO', type: 'location', subType: 'AIRPORT', name: 'Porto Airport', iataCode: 'OPO', address: { cityName: 'Porto', countryName: 'Portugal' } },
    
    // Ireland
    { id: 'DUB', type: 'location', subType: 'AIRPORT', name: 'Dublin Airport', iataCode: 'DUB', address: { cityName: 'Dublin', countryName: 'Ireland' } },
    
    // Denmark
    { id: 'CPH', type: 'location', subType: 'AIRPORT', name: 'Copenhagen Airport', iataCode: 'CPH', address: { cityName: 'Copenhagen', countryName: 'Denmark' } },
    
    // Sweden
    { id: 'ARN', type: 'location', subType: 'AIRPORT', name: 'Stockholm Arlanda Airport', iataCode: 'ARN', address: { cityName: 'Stockholm', countryName: 'Sweden' } },
    
    // Norway
    { id: 'OSL', type: 'location', subType: 'AIRPORT', name: 'Oslo Airport', iataCode: 'OSL', address: { cityName: 'Oslo', countryName: 'Norway' } },
    
    // Finland
    { id: 'HEL', type: 'location', subType: 'AIRPORT', name: 'Helsinki-Vantaa Airport', iataCode: 'HEL', address: { cityName: 'Helsinki', countryName: 'Finland' } },
    
    // Poland
    { id: 'WAW', type: 'location', subType: 'AIRPORT', name: 'Warsaw Chopin Airport', iataCode: 'WAW', address: { cityName: 'Warsaw', countryName: 'Poland' } },
    { id: 'KRK', type: 'location', subType: 'AIRPORT', name: 'Krakow Airport', iataCode: 'KRK', address: { cityName: 'Krakow', countryName: 'Poland' } },
    
    // Czech Republic
    { id: 'PRG', type: 'location', subType: 'AIRPORT', name: 'Vaclav Havel Airport Prague', iataCode: 'PRG', address: { cityName: 'Prague', countryName: 'Czech Republic' } },
    
    // Hungary
    { id: 'BUD', type: 'location', subType: 'AIRPORT', name: 'Budapest Ferenc Liszt Airport', iataCode: 'BUD', address: { cityName: 'Budapest', countryName: 'Hungary' } },
    
    // Romania
    { id: 'OTP', type: 'location', subType: 'AIRPORT', name: 'Henri Coanda Airport', iataCode: 'OTP', address: { cityName: 'Bucharest', countryName: 'Romania' } },
    
    // Bulgaria
    { id: 'SOF', type: 'location', subType: 'AIRPORT', name: 'Sofia Airport', iataCode: 'SOF', address: { cityName: 'Sofia', countryName: 'Bulgaria' } },
    
    // Croatia
    { id: 'ZAG', type: 'location', subType: 'AIRPORT', name: 'Zagreb Airport', iataCode: 'ZAG', address: { cityName: 'Zagreb', countryName: 'Croatia' } },
    
    // USA (major cities)
    { id: 'JFK', type: 'location', subType: 'AIRPORT', name: 'John F Kennedy International Airport', iataCode: 'JFK', address: { cityName: 'New York', countryName: 'United States' } },
    { id: 'LAX', type: 'location', subType: 'AIRPORT', name: 'Los Angeles International Airport', iataCode: 'LAX', address: { cityName: 'Los Angeles', countryName: 'United States' } },
    { id: 'ORD', type: 'location', subType: 'AIRPORT', name: 'O\'Hare International Airport', iataCode: 'ORD', address: { cityName: 'Chicago', countryName: 'United States' } },
    
    // Middle East
    { id: 'DXB', type: 'location', subType: 'AIRPORT', name: 'Dubai International Airport', iataCode: 'DXB', address: { cityName: 'Dubai', countryName: 'United Arab Emirates' } },
    { id: 'AMM', type: 'location', subType: 'AIRPORT', name: 'Queen Alia International Airport', iataCode: 'AMM', address: { cityName: 'Amman', countryName: 'Jordan' } },
    { id: 'DOH', type: 'location', subType: 'AIRPORT', name: 'Hamad International Airport', iataCode: 'DOH', address: { cityName: 'Doha', countryName: 'Qatar' } },
    { id: 'AUH', type: 'location', subType: 'AIRPORT', name: 'Abu Dhabi International Airport', iataCode: 'AUH', address: { cityName: 'Abu Dhabi', countryName: 'United Arab Emirates' } },
    { id: 'CAI', type: 'location', subType: 'AIRPORT', name: 'Cairo International Airport', iataCode: 'CAI', address: { cityName: 'Cairo', countryName: 'Egypt' } },
    { id: 'TLV', type: 'location', subType: 'AIRPORT', name: 'Ben Gurion Airport', iataCode: 'TLV', address: { cityName: 'Tel Aviv', countryName: 'Israel' } },
    { id: 'BEY', type: 'location', subType: 'AIRPORT', name: 'Beirut–Rafic Hariri International Airport', iataCode: 'BEY', address: { cityName: 'Beirut', countryName: 'Lebanon' } },
    { id: 'RUH', type: 'location', subType: 'AIRPORT', name: 'King Khalid International Airport', iataCode: 'RUH', address: { cityName: 'Riyadh', countryName: 'Saudi Arabia' } },
    { id: 'JED', type: 'location', subType: 'AIRPORT', name: 'King Abdulaziz International Airport', iataCode: 'JED', address: { cityName: 'Jeddah', countryName: 'Saudi Arabia' } },
    { id: 'KWI', type: 'location', subType: 'AIRPORT', name: 'Kuwait International Airport', iataCode: 'KWI', address: { cityName: 'Kuwait City', countryName: 'Kuwait' } },
    { id: 'BAH', type: 'location', subType: 'AIRPORT', name: 'Bahrain International Airport', iataCode: 'BAH', address: { cityName: 'Manama', countryName: 'Bahrain' } },
    { id: 'MCT', type: 'location', subType: 'AIRPORT', name: 'Muscat International Airport', iataCode: 'MCT', address: { cityName: 'Muscat', countryName: 'Oman' } },
    
    // Asia
    { id: 'SIN', type: 'location', subType: 'AIRPORT', name: 'Singapore Changi Airport', iataCode: 'SIN', address: { cityName: 'Singapore', countryName: 'Singapore' } },
    { id: 'HKG', type: 'location', subType: 'AIRPORT', name: 'Hong Kong International Airport', iataCode: 'HKG', address: { cityName: 'Hong Kong', countryName: 'Hong Kong' } },
    { id: 'NRT', type: 'location', subType: 'AIRPORT', name: 'Narita International Airport', iataCode: 'NRT', address: { cityName: 'Tokyo', countryName: 'Japan' } },
    { id: 'ICN', type: 'location', subType: 'AIRPORT', name: 'Incheon International Airport', iataCode: 'ICN', address: { cityName: 'Seoul', countryName: 'South Korea' } },
    { id: 'BKK', type: 'location', subType: 'AIRPORT', name: 'Suvarnabhumi Airport', iataCode: 'BKK', address: { cityName: 'Bangkok', countryName: 'Thailand' } },
    { id: 'KUL', type: 'location', subType: 'AIRPORT', name: 'Kuala Lumpur International Airport', iataCode: 'KUL', address: { cityName: 'Kuala Lumpur', countryName: 'Malaysia' } },
    { id: 'DEL', type: 'location', subType: 'AIRPORT', name: 'Indira Gandhi International Airport', iataCode: 'DEL', address: { cityName: 'New Delhi', countryName: 'India' } },
    { id: 'BOM', type: 'location', subType: 'AIRPORT', name: 'Chhatrapati Shivaji Maharaj International Airport', iataCode: 'BOM', address: { cityName: 'Mumbai', countryName: 'India' } },
    { id: 'PEK', type: 'location', subType: 'AIRPORT', name: 'Beijing Capital International Airport', iataCode: 'PEK', address: { cityName: 'Beijing', countryName: 'China' } },
    { id: 'PVG', type: 'location', subType: 'AIRPORT', name: 'Shanghai Pudong International Airport', iataCode: 'PVG', address: { cityName: 'Shanghai', countryName: 'China' } },
    
    // Africa
    { id: 'JNB', type: 'location', subType: 'AIRPORT', name: 'O.R. Tambo International Airport', iataCode: 'JNB', address: { cityName: 'Johannesburg', countryName: 'South Africa' } },
    { id: 'CPT', type: 'location', subType: 'AIRPORT', name: 'Cape Town International Airport', iataCode: 'CPT', address: { cityName: 'Cape Town', countryName: 'South Africa' } },
    { id: 'ADD', type: 'location', subType: 'AIRPORT', name: 'Addis Ababa Bole International Airport', iataCode: 'ADD', address: { cityName: 'Addis Ababa', countryName: 'Ethiopia' } },
    { id: 'NBO', type: 'location', subType: 'AIRPORT', name: 'Jomo Kenyatta International Airport', iataCode: 'NBO', address: { cityName: 'Nairobi', countryName: 'Kenya' } },
    { id: 'LOS', type: 'location', subType: 'AIRPORT', name: 'Murtala Muhammed International Airport', iataCode: 'LOS', address: { cityName: 'Lagos', countryName: 'Nigeria' } },
    { id: 'CMN', type: 'location', subType: 'AIRPORT', name: 'Mohammed V International Airport', iataCode: 'CMN', address: { cityName: 'Casablanca', countryName: 'Morocco' } },
    
    // Australia & Oceania
    { id: 'SYD', type: 'location', subType: 'AIRPORT', name: 'Sydney Kingsford Smith Airport', iataCode: 'SYD', address: { cityName: 'Sydney', countryName: 'Australia' } },
    { id: 'MEL', type: 'location', subType: 'AIRPORT', name: 'Melbourne Airport', iataCode: 'MEL', address: { cityName: 'Melbourne', countryName: 'Australia' } },
    { id: 'AKL', type: 'location', subType: 'AIRPORT', name: 'Auckland Airport', iataCode: 'AKL', address: { cityName: 'Auckland', countryName: 'New Zealand' } },
    
    // South America
    { id: 'GRU', type: 'location', subType: 'AIRPORT', name: 'São Paulo/Guarulhos International Airport', iataCode: 'GRU', address: { cityName: 'São Paulo', countryName: 'Brazil' } },
    { id: 'GIG', type: 'location', subType: 'AIRPORT', name: 'Rio de Janeiro/Galeão International Airport', iataCode: 'GIG', address: { cityName: 'Rio de Janeiro', countryName: 'Brazil' } },
    { id: 'EZE', type: 'location', subType: 'AIRPORT', name: 'Ministro Pistarini International Airport', iataCode: 'EZE', address: { cityName: 'Buenos Aires', countryName: 'Argentina' } },
    { id: 'BOG', type: 'location', subType: 'AIRPORT', name: 'El Dorado International Airport', iataCode: 'BOG', address: { cityName: 'Bogotá', countryName: 'Colombia' } },
    { id: 'LIM', type: 'location', subType: 'AIRPORT', name: 'Jorge Chávez International Airport', iataCode: 'LIM', address: { cityName: 'Lima', countryName: 'Peru' } },
    
    // Canada
    { id: 'YYZ', type: 'location', subType: 'AIRPORT', name: 'Toronto Pearson International Airport', iataCode: 'YYZ', address: { cityName: 'Toronto', countryName: 'Canada' } },
    { id: 'YVR', type: 'location', subType: 'AIRPORT', name: 'Vancouver International Airport', iataCode: 'YVR', address: { cityName: 'Vancouver', countryName: 'Canada' } },
    { id: 'YUL', type: 'location', subType: 'AIRPORT', name: 'Montréal-Pierre Elliott Trudeau International Airport', iataCode: 'YUL', address: { cityName: 'Montreal', countryName: 'Canada' } },
  ];
  
  // Search through all airports
  const searchTerm = keyword.toLowerCase();
  const matches = allAirports.filter(airport => 
    airport.name.toLowerCase().includes(searchTerm) ||
    airport.iataCode.toLowerCase().includes(searchTerm) ||
    airport.address.cityName.toLowerCase().includes(searchTerm) ||
    airport.address.countryName.toLowerCase().includes(searchTerm)
  ).slice(0, 10);
  
  return matches.length > 0 ? matches : [
    { id: '99', type: 'location', subType: 'AIRPORT', name: `${keyword} Airport`, iataCode: keyword.toUpperCase().substring(0, 3), address: { cityName: keyword, countryName: 'International' } }
  ];
};

// Get flight recommendations based on origin
exports.getFlightInspiration = async (origin) => {
  try {
    console.log(`🔍 Getting flight destinations from: ${origin}`);
    const destinations = await amadeusClient.getFlightDestinations(origin);
    console.log(`✅ Found ${destinations.length} destinations from Amadeus API`);
    return destinations;
  } catch (error) {
    console.error('❌ Flight Inspiration Error:', error.message);
    return [];
  }
};
