const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// API-key as environment variable
const API_KEY = process.env.EXCHANGE_RATE_API_KEY; // Make sure this is set on Render

let cachedRates = []; // Variable to store the fetched data

// Serve static files including the HTML file
app.use(express.static(path.join(__dirname)));

// CORS header
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

// Fetch currency rates function for DnB API
async function fetchRates() {
  try {
    const response = await fetch(`https://api.dnb.no/currencies/v2/convert/NOK`, {
      headers: {
        'x-api-key': API_KEY
      }
    });
    const result = await response.json();

    if (!result || !result.data) {
      throw new Error("Missing rates from DnB API");
    }

    const now = new Date();
    cachedRates = result.data.map(rate => {
      return {
        currency: rate.currency,
        quoteCurrency: "NOK",
        midRate: rate.midRate,  // Assuming 'midRate' is the exchange rate
        updatedDate: now.toISOString()
      };
    });

    console.log('✅ Rates updated successfully');
  } catch (err) {
    console.error('❌ Fetch error:', err);
  }
}

// Initial fetch when server starts
fetchRates();

// API endpoint that returns cached data
app.get('/api/rates', (req, res) => {
  res.json(cachedRates); // Send the stored rates
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Currency Widget API running at http://localhost:${PORT}/api/rates`);
});
