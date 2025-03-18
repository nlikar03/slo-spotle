import { useState, useEffect } from "react";
import { FaSearch, FaQuestionCircle } from "react-icons/fa";
import artists from "./data/data.json";
import cityCoordinates from "./data/city_coordinates.json";
import "./styles.css";


function haversineDistance(lat1, lon1, lat2, lon2) {
  const toRadians = (degrees) => degrees * (Math.PI / 180);
  const R = 6371; // Radius of the Earth in km

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in km
}


const getCityColorClass = (distance) => {
  if (distance <= 5) return "city-color-0"; // Green
  if (distance <= 25) return "city-color-1"; // Light green
  if (distance <= 50) return "city-color-2"; // Yellow
  if (distance <= 100) return "city-color-3"; // Orange
  if (distance <= 150) return "city-color-4"; // Red
  return "city-color-default"; // Default (grey)
};

const getCityColor = (guessedCity, targetCity) => {
  const guessedCoords = cityCoordinates[guessedCity];
  const targetCoords = cityCoordinates[targetCity];

  if (!guessedCoords || !targetCoords) return "city-color-default"; // Default color if coordinates are not found

  const distance = haversineDistance(
    guessedCoords.lat,
    guessedCoords.lon,
    targetCoords.lat,
    targetCoords.lon
  );

  return getCityColorClass(distance);
};

function App() {
  const [artist, setArtist] = useState(null);
  const [guess, setGuess] = useState("");
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredArtists, setFilteredArtists] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [guessedArtists, setGuessedArtists] = useState([]); // Track guessed artists
  const [attemptsLeft, setAttemptsLeft] = useState(10); // Število preostalih poskusov
  const [showProfilePic, setShowProfilePic] = useState(false); // State for showing profile picture
  const [hintImageUnlocked, setHintImageUnlocked] = useState(false); // Track if image hint is unlocked
  const [hintMusicUnlocked, setHintMusicUnlocked] = useState(false); // Track if music hint is unlocked
  const [showMusicPlayer, setShowMusicPlayer] = useState(false); // Track if music player is shown
  const [gameLost, setGameLost] = useState(false); // Track if the game is lost




  const getGenreColor = (guessedGenre, targetGenres) => {
    if (targetGenres.includes(guessedGenre)) {
      return "green";
    }
    return "black"; // Default color for non-matching genres
  };
  useEffect(() => {
    setArtist(artists[Math.floor(Math.random() * artists.length)]);
  }, []);

  useEffect(() => {
    if (searchQuery) {
      // Filter artists based on the search query and exclude guessed artists
      const filtered = artists
        .filter(
          (a) =>
            a.artist_name.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !guessedArtists.some(
              (guessed) => guessed.artist_name.toLowerCase() === a.artist_name.toLowerCase()
            )
        )
        .slice(0, 10); // Limit to 10 results
      setFilteredArtists(filtered);
      setShowDropdown(true); // Show dropdown when there's a query
    } else {
      setFilteredArtists([]); // Clear results if query is empty
      setShowDropdown(false); // Hide dropdown
    }
  }, [searchQuery, guessedArtists]); // Re-run when searchQuery or guessedArtists changes

  const handleArtistSelect = (selectedArtist) => {
    setGuess(selectedArtist); // Set the selected artist as the guess
    setSearchQuery(selectedArtist); // Populate the search bar with the selected artist
    setShowDropdown(false); // Hide the dropdown
    checkGuess(selectedArtist); // Automatically check the guess
  };

  const [gameWon, setGameWon] = useState(false); // Track if the game is won

  const checkGuess = (selectedArtist = guess) => {
    if (attemptsLeft === 0) return; // Preveri, če je še kakšen poskus na voljo
  
    // Check if the artist has already been guessed
    if (
      guessedArtists.some(
        (guessed) => guessed.artist_name.toLowerCase() === selectedArtist.toLowerCase()
      )
    ) {
      setMessage("❌ Artist already guessed!");
      return;
    }
  
    const guessed = artists.find(
      (a) => a.artist_name.toLowerCase() === selectedArtist.toLowerCase()
    );
  
    if (guessed) {
      setGuessedArtists((prev) => [guessed, ...prev]); // Dodaj ugibanega izvajalca na seznam
      setAttemptsLeft((prev) => prev - 1); // Zmanjšaj število preostalih poskusov
      setSearchQuery("");
  
      if (guessed.artist_name.toLowerCase() === artist.artist_name.toLowerCase()) {
        setGameWon(true); // Set gameWon to true
      } else if (attemptsLeft === 1) {
        setGameLost(true); // Set gameLost to true if no attempts left
      }
    } else {
      setAttemptsLeft((prev) => prev - 1); // Zmanjšaj število preostalih poskusov
      if (attemptsLeft === 1) {
        setGameLost(true); // Set gameLost to true if no attempts left
      }
    }
  };

  useEffect(() => {
    // Unlock image hint after 3 incorrect guesses
    if (attemptsLeft <= 7) {
      setHintImageUnlocked(true);
    }
    // Unlock music hint after 5 incorrect guesses
    if (attemptsLeft <= 5) {
      setHintMusicUnlocked(true);
    }
  }, [attemptsLeft]);

  const playPreview = () => {
    setShowMusicPlayer(true); // Show music player when hint is clicked
  };

  const removeCommas = (value) => {
    if (typeof value === "string") {
      return parseFloat(value.replace(/,/g, ""));
    }
    return Number(value);
  };

  const getAttributeColor = (attribute, guessedValue, targetValue, isCorrectArtist) => {
    // If the guessed artist is the correct artist, all attributes should be green
    if (isCorrectArtist) return "green";
  
    // Convert values to numbers to ensure correct comparisons (for numeric attributes)
    const removeCommas = (value) => {
      if (typeof value === "string" && attribute !== "gender") {
        return parseFloat(value.replace(/,/g, ""));
      }
      return Number(value);
    };
  
    const guessed = attribute === "gender" ? guessedValue : removeCommas(guessedValue);
    const target = attribute === "gender" ? targetValue : removeCommas(targetValue);
  
    if (guessed === target) {
      if (attribute === "gender") return "green";
      // For other attributes, return green (exact match)
      return "green";
    }
  
    switch (attribute) {
      case "monthly_listeners":
        // Yellow if the difference is between 1 and 500
        const diffMonthly = Math.abs(guessed - target);
        return diffMonthly >= 1 && diffMonthly <= 500 ? "yellow" : "grey";
  
      case "number_of_performers":
        // Yellow if the difference is 1 or 2
        const diffPerformers = Math.abs(guessed - target);
        return diffPerformers <= 2 ? "yellow" : "grey";
  
      case "career_start_year":
        // Yellow if the difference is 1 to 5
        const diffYear = Math.abs(guessed - target);
        return diffYear <= 5 ? "yellow" : "grey";
  
      case "gender":
        // Gender is only green or yellow
        return guessed === target ? "yellow" : "grey";
  
      default:
        return "grey"; // Default for other attributes
    }
  };

  const toggleProfilePic = () => {
    setShowProfilePic((prev) => !prev);
  };

  if (!artist) return <h1>Loading...</h1>;

  return (
    <div className="app">
      <div className="logo-container">
        <img src="./image/drawing.png" alt="Slovenian Spotle Logo" className="logo" />
        <button className="question-button" onClick={() => window.open("/slo-spotle/help/help.html", "_blank")}>
          <FaQuestionCircle />
        </button>
      </div>
  
      
  
      {/* Števec poskusov */}
      <div className="attempts-counter">
        Še {attemptsLeft} poskusov
      </div>
  
      {/* Search Input Container */}
      <div className="input-container">
        <input
          type="text"
          placeholder="Vpiši ime..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setShowDropdown(true)} // Show dropdown when input is focused
        />
        <FaSearch className="search-icon" />
  
        {/* Dropdown Menu */}
        {showDropdown && filteredArtists.length > 0 && (
          <div className="dropdown">
            {filteredArtists.map((a) => (
              <div
                key={a.artist_name}
                className="dropdown-item"
                onClick={() => handleArtistSelect(a.artist_name)}
              >
                {a.artist_name}
              </div>
            ))}
          </div>
        )}
      </div>
  
      {/* Hint Buttons Container */}
      <div className="hint-buttons-container">
        <button 
          onClick={playPreview} 
          className="hint-button" 
          disabled={!hintMusicUnlocked}
        >
          Predvajaj glasbo
        </button>
        <button 
          onClick={toggleProfilePic} 
          className="hint-button" 
          disabled={!hintImageUnlocked}
        >
          Prikaži sliko
        </button>
      </div>

      {showMusicPlayer && (
        <div className="profile-pic-container">
          <p className="hint-text">Skladba: {artist.song_name}</p>
          <audio controls autoPlay>
            <source src={`./audio/${artist.spotify_link}.mp3`} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
          
        </div>
      )}

  
      {/* Show artist profile picture if Namig 2 is clicked */}
      {showProfilePic && (
          <div className="profile-pic-container">
            <img
              src={artist.artist_picture_url}
              alt={artist.artist_name}
              className="artist-image"
            />
            <p className="hint-text">Namig slike</p>
          </div>
        )}

  
      {/* Prikaz vseh ugibanih izvajalcev */}
      {guessedArtists.map((guessed, index) => (
        <div key={`${guessed.artist_name}-${index}`} className="guessed-artist">
          <h2>{guessed.artist_name}</h2>
          <img
            src={guessed.artist_picture_url}
            alt={guessed.artist_name}
            className="artist-image"
          />
          <div className="attributes">
            <div className={`attribute-box ${getAttributeColor("career_start_year", guessed.career_start_year, artist.career_start_year, guessed.artist_name.toLowerCase() === artist.artist_name.toLowerCase())}`}>
              Začetno leto: {guessed.career_start_year}
              {guessed.artist_name.toLowerCase() !== artist.artist_name.toLowerCase() && (
                <>
                  {guessed.career_start_year > artist.career_start_year && (
                    <img src="./image/arrow-down.svg" alt="↑" className="arrow-icon" />
                  )}
                  {guessed.career_start_year < artist.career_start_year && (
                    <img src="./image/arrow-up.svg" alt="↓" className="arrow-icon" />
                  )}
                </>
              )}
            </div>
            <div className={`attribute-box ${getAttributeColor("monthly_listeners", guessed.monthly_listeners, artist.monthly_listeners, guessed.artist_name.toLowerCase() === artist.artist_name.toLowerCase())}`}>
              Mesečni poslušalci: {guessed.monthly_listeners}
              {guessed.artist_name.toLowerCase() !== artist.artist_name.toLowerCase() && (
                <>
                  {removeCommas(guessed.monthly_listeners) > removeCommas(artist.monthly_listeners) && (
                    <img src="./image/arrow-down.svg" alt="↑" className="arrow-icon" />
                  )}
                  {removeCommas(guessed.monthly_listeners) < removeCommas(artist.monthly_listeners) && (
                    <img src="./image/arrow-up.svg" alt="↓" className="arrow-icon" />
                  )}
                </>
              )}
            </div>
            <div className={`attribute-box ${getAttributeColor("gender", guessed.gender, artist.gender, guessed.artist_name.toLowerCase() === artist.artist_name.toLowerCase())}`}>
              Spol: {guessed.gender}
            </div>
            <div className={`attribute-box ${getAttributeColor("number_of_performers", guessed.number_of_performers, artist.number_of_performers, guessed.artist_name.toLowerCase() === artist.artist_name.toLowerCase())}`}>
              Število članov: {guessed.number_of_performers}
              {guessed.artist_name.toLowerCase() !== artist.artist_name.toLowerCase() && (
                <>
                  {guessed.number_of_performers > artist.number_of_performers && (
                    <img src="./image/arrow-down.svg" alt="↑" className="arrow-icon" />
                  )}
                  {guessed.number_of_performers < artist.number_of_performers && (
                    <img src="./image/arrow-up.svg" alt="↓" className="arrow-icon" />
                  )}
                </>
              )}
            </div>
            <div className="attribute-box">
                Žanri: {guessed.artist_genre.split(", ").map((genre, index) => (
                  <span
                    key={index}
                    style={{ color: getGenreColor(genre, artist.artist_genre.split(", ")) }}
                  >
                    {genre}
                    {index < guessed.artist_genre.split(", ").length - 1 ? ", " : ""}
                  </span>
                ))}
              </div>
              <div className={`attribute-box ${getCityColor(guessed.city_of_origin, artist.city_of_origin)}`}>
                  Mesto izvora: {guessed.city_of_origin}
              </div>
          </div>
        </div>
      ))}
  
      <p className="besedilo1">Poišči današnjega izvajalca</p>
      <p className="besedilo1">Začneš tako, da vpišeš ime glasbenega izvajalca ali skupine</p>
  
      <p>{message}</p>
      {gameWon && (
  <>
    <div className="overlay"></div>
    <div className="victory-message">
      <h1>Bravo, zmagali ste!</h1>
      <h2>Pravilno ste uganili ✅, izvalajec je bil {artist.artist_name}</h2> {/* Add artist name */}
      <img
        src={artist.artist_picture_url}
        alt={artist.artist_name}
        className="artist-image"
      />
      <audio controls autoPlay>
        <source src={`./audio/${artist.spotify_link}.mp3`} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
    </div>
  </>
)}
{gameLost && (
  <>
    <div className="overlay"></div>
    <div className="victory-message">
      <h1>❌ Žal ste izgubili! </h1>
      <h2>Pravilni izvajalec je bil {artist.artist_name}</h2> {/* Add artist name */}
      <img
        src={artist.artist_picture_url}
        alt={artist.artist_name}
        className="artist-image"
      />
      <audio controls autoPlay>
        <source src={`./audio/${artist.spotify_link}.mp3`} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
    </div>
  </>
)}
    </div>
  );
}

export default App;