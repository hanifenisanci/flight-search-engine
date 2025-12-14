require('dotenv').config();
const visaService = require('./services/visaService');

async function testVisaAPI() {
  console.log('🧪 Testing Visa Requirement API\n');
  
  // Test cases
  const tests = [
    { citizenship: 'US', destination: 'FR', label: 'US citizen to France' },
    { citizenship: 'TR', destination: 'US', label: 'Turkish citizen to USA' },
    { citizenship: 'GB', destination: 'JP', label: 'UK citizen to Japan' },
    { citizenship: 'IN', destination: 'DE', label: 'Indian citizen to Germany' },
  ];

  for (const test of tests) {
    console.log(`\n📍 ${test.label}:`);
    console.log(`   Passport: ${test.citizenship} → Destination: ${test.destination}`);
    
    try {
      const result = await visaService.checkVisaRequirement(
        test.citizenship,
        test.destination
      );
      
      console.log(`   ✅ Result:`, {
        required: result.required,
        type: result.type,
        note: result.note,
        duration: result.duration || 'N/A'
      });
    } catch (error) {
      console.error(`   ❌ Error:`, error.message);
    }
  }
}

// Run the test
testVisaAPI()
  .then(() => {
    console.log('\n✅ Test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });
