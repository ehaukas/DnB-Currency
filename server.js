const express = require('express');
const fetch = require('node-fetch');  // Import node-fetch to use fetch in Node.js
const path = require('path');  // Import path module to serve static files
const app = express();
const PORT = process.env.PORT || 3000;

// API-key as environment variable
const API_KEY = process.env.EXCHANGE_RATE_API_KEY; // Make sure this is set on Render

// Allow CORS from anywhere
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, x-api-key');
  next();
});

// Serve static files (HTML file from the public folder)
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint to fetch exchange rates from DNB API
app.get('/api/rates', async (req, res) => {
  try {
    const response = await fetch('https://partner.api.dnb.no/markets/currencies/v2/convert/NOK', {
      method: 'GET',
      headers: { 'x-api-key': API_KEY }
    });

    if (!response.ok) {
      return res.status(response.status).send(`DNB API error: ${response.statusText}`);
    }

    const data = await response.json();

    // Define the target currencies (EUR, GBP, USD, DKK)
    const targetCurrencies = ['EUR', 'GBP', 'USD', 'DKK'];

    // Filter the data to return only the relevant rates in the specified order
    const adaptedData = targetCurrencies.map(currency => {
      const rate = data.find(rate => rate.currency === currency);
      return {
        currency: rate ? rate.currency : currency,
        midRate: rate ? rate.midRate : null,
        updatedDate: rate ? rate.updatedDate : null
      };
    });

    // Send the filtered and ordered data to the client
    res.json(adaptedData);
  } catch (err) {
    res.status(500).send(`Server error: ${err.message}`);
  }
});

// Serve the HTML page on the root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'currency-widget.html'));
});

// Start the server (Render will use the environment variable PORT)
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

