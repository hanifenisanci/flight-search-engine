require('dotenv').config();
const https = require('https');
const querystring = require('querystring');

console.log('🔍 Detailed Amadeus API Diagnostics\n');
console.log('API Key:', process.env.AMADEUS_API_KEY);
console.log('API Secret:', process.env.AMADEUS_API_SECRET);
console.log('\n' + '='.repeat(60) + '\n');

// Manual OAuth2 token request
function getAccessToken() {
  return new Promise((resolve, reject) => {
    const postData = querystring.stringify({
      grant_type: 'client_credentials',
      client_id: process.env.AMADEUS_API_KEY,
      client_secret: process.env.AMADEUS_API_SECRET,
    });

    const options = {
      hostname: 'test.api.amadeus.com',
      port: 443,
      path: '/v1/security/oauth2/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    console.log('📡 Making direct HTTPS request to Amadeus...');
    console.log('URL: https://test.api.amadeus.com/v1/security/oauth2/token');
    console.log('Method: POST\n');

    const req = https.request(options, (res) => {
      let data = '';

      console.log('📊 Response Status Code:', res.statusCode);
      console.log('📋 Response Headers:', JSON.stringify(res.headers, null, 2));
      console.log('');

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log('📦 Response Body:');
        console.log(data);
        console.log('');

        if (res.statusCode === 200) {
          try {
            const parsed = JSON.parse(data);
            console.log('✅ SUCCESS! Access token obtained:');
            console.log('Token Type:', parsed.token_type);
            console.log('Expires In:', parsed.expires_in, 'seconds');
            console.log('Access Token:', parsed.access_token.substring(0, 30) + '...');
            resolve(parsed);
          } catch (e) {
            console.log('❌ Could not parse response as JSON');
            reject(e);
          }
        } else {
          console.log('❌ FAILED - HTTP Status:', res.statusCode);
          try {
            const error = JSON.parse(data);
            console.log('Error Code:', error.error);
            console.log('Error Description:', error.error_description);
            
            if (error.error === 'invalid_client') {
              console.log('\n🔧 ISSUE IDENTIFIED:');
              console.log('   Your API credentials are INVALID or INACTIVE.');
              console.log('\n✅ SOLUTIONS:');
              console.log('   1. Go to: https://developers.amadeus.com/my-apps');
              console.log('   2. Check if your app is in "Test" mode');
              console.log('   3. Verify your API Key and Secret are correct');
              console.log('   4. If just created, wait 1-2 hours for activation');
              console.log('   5. Try generating NEW credentials if nothing works');
            }
          } catch (e) {
            console.log('Raw error:', data);
          }
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    });

    req.on('error', (error) => {
      console.log('❌ REQUEST FAILED');
      console.log('Error:', error.message);
      console.log('\n🔧 Possible causes:');
      console.log('   - Network connectivity issues');
      console.log('   - Firewall blocking HTTPS requests');
      console.log('   - DNS resolution problems');
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Run the test
getAccessToken()
  .then(() => {
    console.log('\n' + '='.repeat(60));
    console.log('✅ Your Amadeus API is WORKING!');
    console.log('   Real flight data will be used in your application.');
    console.log('='.repeat(60));
  })
  .catch((error) => {
    console.log('\n' + '='.repeat(60));
    console.log('❌ Amadeus API test failed');
    console.log('   Your application will use mock data for now.');
    console.log('='.repeat(60));
  });
