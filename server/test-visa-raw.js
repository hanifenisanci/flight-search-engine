const axios = require('axios');

async function testAPIResponse() {
  console.log('Testing API response structure:\n');
  
  try {
    // Test a few different cases
    const tests = [
      { from: 'US', to: 'FR', label: 'US → France (should be visa free)' },
      { from: 'TR', to: 'US', label: 'Turkey → USA (should need visa)' },
      { from: 'GB', to: 'TR', label: 'UK → Turkey (should be e-visa)' }
    ];
    
    for (const test of tests) {
      console.log(`\n${test.label}:`);
      const response = await axios.get(
        `https://rough-sun-2523.fly.dev/visa/${test.from}/${test.to}`
      );
      console.log('Raw API response:', JSON.stringify(response.data, null, 2));
    }
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

testAPIResponse();
