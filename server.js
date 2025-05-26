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

// Fetch currency rates function
async function fetchRates() {
  try {
    const response = await fetch(`https://api.exchangerate.host/live?access_key=${API_KEY}&source=NOK&currencies=EUR,GBP,USD,DKK&format=1`);
    const result = await response.json();

    if (!result.quotes) {
      throw new Error("Missing quotes from API");
    }

    const now = new Date();
    cachedRates = Object.entries(result.quotes).map(([pair, rate]) => {
      const currency = pair.slice(3); // Remove 'NOK' prefix
      return {
        currency,
        quoteCurrency: "NOK",
        midRate: 1 / rate,  // Convert to desired currency format
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
