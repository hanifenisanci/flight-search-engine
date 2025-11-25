require('dotenv').config();
const Amadeus = require('amadeus');

console.log('🔍 Testing Amadeus API Credentials...\n');
console.log('Configuration:');
console.log('API Key:', process.env.AMADEUS_API_KEY);
console.log('API Secret:', process.env.AMADEUS_API_SECRET);
console.log('Hostname:', process.env.AMADEUS_HOSTNAME || 'test.api.amadeus.com');
console.log('\n' + '='.repeat(60) + '\n');

const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_API_KEY,
  clientSecret: process.env.AMADEUS_API_SECRET,
  hostname: process.env.AMADEUS_HOSTNAME || 'test.api.amadeus.com',
});

// Test 1: Get Access Token
async function testAccessToken() {
  console.log('📝 Test 1: Getting Access Token...');
  try {
    // Try to make a simple API call that requires authentication
    const response = await amadeus.shopping.flightDestinations.get({
      origin: 'NYC',
    });
    console.log('✅ SUCCESS: Access token obtained and API is working!');
    console.log('📊 Response status:', response.statusCode);
    console.log('📍 Found', response.data.length, 'destinations from NYC');
    return true;
  } catch (error) {
    console.log('❌ FAILED: Could not obtain access token');
    console.log('Error Code:', error.code);
    console.log('Error Message:', error.description || error.message);
    if (error.response) {
      console.log('Status Code:', error.response.statusCode);
      console.log('Response Body:', error.response.body);
    }
    return false;
  }
}

// Test 2: Search Locations
async function testLocationSearch() {
  console.log('\n📝 Test 2: Testing Location Search...');
  try {
    const response = await amadeus.referenceData.locations.get({
      keyword: 'LON',
      subType: 'AIRPORT',
    });
    console.log('✅ SUCCESS: Location search working!');
    console.log('📊 Found', response.data.length, 'airports');
    if (response.data.length > 0) {
      console.log('📍 Example:', response.data[0].name, '-', response.data[0].iataCode);
    }
    return true;
  } catch (error) {
    console.log('❌ FAILED: Location search failed');
    console.log('Error:', error.description || error.message);
    return false;
  }
}

// Test 3: Search Flights
async function testFlightSearch() {
  console.log('\n📝 Test 3: Testing Flight Search...');
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 7);
    const departureDate = tomorrow.toISOString().split('T')[0];

    const response = await amadeus.shopping.flightOffersSearch.get({
      originLocationCode: 'NYC',
      destinationLocationCode: 'LON',
      departureDate: departureDate,
      adults: 1,
      max: 5,
    });
    console.log('✅ SUCCESS: Flight search working!');
    console.log('📊 Found', response.data.length, 'flight offers');
    if (response.data.length > 0) {
      const flight = response.data[0];
      console.log('💰 Cheapest flight price:', flight.price.total, flight.price.currency);
    }
    return true;
  } catch (error) {
    console.log('❌ FAILED: Flight search failed');
    console.log('Error:', error.description || error.message);
    return false;
  }
}

// Run all tests
async function runTests() {
  const test1 = await testAccessToken();
  
  if (test1) {
    await testLocationSearch();
    await testFlightSearch();
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n📋 TEST SUMMARY:');
  if (test1) {
    console.log('✅ Your Amadeus API keys are WORKING!');
    console.log('   The application will now use real flight data.');
  } else {
    console.log('❌ Your Amadeus API keys are NOT working yet.');
    console.log('\n🔧 Possible reasons:');
    console.log('   1. API keys need more time to activate (wait 1-2 hours)');
    console.log('   2. API keys are incorrect - verify at https://developers.amadeus.com/my-apps');
    console.log('   3. Network/firewall blocking access to test.api.amadeus.com');
    console.log('   4. App not activated in Amadeus dashboard');
    console.log('\n💡 Your app will continue working with mock data until APIs are active.');
  }
  console.log('\n' + '='.repeat(60) + '\n');
}

runTests();
