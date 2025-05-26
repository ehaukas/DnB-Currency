const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve the HTML widget
app.use(express.static(path.join(__dirname)));

app.get('/api/rates', (req, res) => {
  const fakeData = [
    {
      currency: "EUR",
      country: "EU",
      quoteCurrency: "NOK",
      unit: 100,
      updatedDate: new Date().toISOString(),
      midRate: 11.23
    },
    {
      currency: "USD",
      country: "US",
      quoteCurrency: "NOK",
      unit: 100,
      updatedDate: new Date().toISOString(),
      midRate: 10.48
    },
    {
      currency: "DKK",
      country: "DK",
      quoteCurrency: "NOK",
      unit: 100,
      updatedDate: new Date().toISOString(),
      midRate: 1.51
    }
  ];
  res.json(fakeData);
});

app.listen(PORT, () => {
  console.log(`Fake DNB Proxy running at http://localhost:${PORT}`);
});
