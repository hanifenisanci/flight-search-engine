const https = require('https');
const querystring = require('querystring');

class AmadeusClient {
  constructor(apiKey, apiSecret) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.hostname = 'test.api.amadeus.com';
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  async getAccessToken() {
    // Return cached token if still valid
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    return new Promise((resolve, reject) => {
      const postData = querystring.stringify({
        grant_type: 'client_credentials',
        client_id: this.apiKey,
        client_secret: this.apiSecret,
      });

      const options = {
        hostname: this.hostname,
        port: 443,
        path: '/v1/security/oauth2/token',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(postData),
        },
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          if (res.statusCode === 200) {
            const parsed = JSON.parse(data);
            this.accessToken = parsed.access_token;
            this.tokenExpiry = Date.now() + (parsed.expires_in * 1000) - 60000; // Refresh 1 min early
            console.log('✅ Amadeus access token obtained successfully');
            resolve(this.accessToken);
          } else {
            reject(new Error(`Token request failed: ${res.statusCode} - ${data}`));
          }
        });
      });

      req.on('error', reject);
      req.write(postData);
      req.end();
    });
  }

  async makeRequest(path, params = {}) {
    const token = await this.getAccessToken();
    const queryString = querystring.stringify(params);
    const fullPath = `${path}?${queryString}`;

    return new Promise((resolve, reject) => {
      const options = {
        hostname: this.hostname,
        port: 443,
        path: fullPath,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          if (res.statusCode === 200) {
            resolve(JSON.parse(data));
          } else {
            reject(new Error(`API request failed: ${res.statusCode} - ${data}`));
          }
        });
      });

      req.on('error', reject);
      req.end();
    });
  }

  async searchFlights(params) {
    const apiParams = {
      originLocationCode: params.origin,
      destinationLocationCode: params.destination,
      departureDate: params.departureDate,
      adults: params.adults || 1,
      travelClass: params.travelClass || 'ECONOMY',
      currencyCode: params.currency || 'USD',
      max: params.max || 50,
    };

    if (params.returnDate) {
      apiParams.returnDate = params.returnDate;
    }

    const response = await this.makeRequest('/v2/shopping/flight-offers', apiParams);
    return response.data;
  }

  async searchLocations(keyword) {
    const response = await this.makeRequest('/v1/reference-data/locations', {
      keyword: keyword,
      subType: 'AIRPORT,CITY',
    });
    return response.data;
  }

  async getFlightDestinations(origin) {
    const response = await this.makeRequest('/v1/shopping/flight-destinations', {
      origin: origin,
    });
    return response.data;
  }
}

module.exports = AmadeusClient;
