const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const app = express();

admin.initializeApp();
const artists = require('./data/data.json');

app.get('/getTodaysArtist', (req, res) => {
  const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
  const artist = artists[Math.floor(Math.random() * artists.length)];

  // Store the selected artist in Firestore
  admin.firestore().collection('dailyArtists').doc(today).set({
    artist: artist
  })
  .then(() => {
    res.status(200).send(artist);
  })
  .catch((error) => {
    res.status(500).send(error);
  });
});

// Listen on the correct port
const PORT = process.env.PORT || 8080; // Use the PORT environment variable
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

exports.getTodaysArtist = functions.https.onRequest(app);