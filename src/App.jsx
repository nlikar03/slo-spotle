import { useState, useEffect } from "react";
import { FaSearch, FaQuestionCircle } from "react-icons/fa";
import artists from "./data/data.json";
import "./styles.css";

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
        setMessage("✅ Correct!");
      } else {
        setMessage("❌ Try again!");
      }
    } else {
      setMessage("❌ Artist not found!");
    }
  };

  const playPreview = () => {
    const audio = new Audio(`public/audio/${artist.spotify_link}.mp3`);
    audio.play();
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
        <button className="question-button" onClick={() => window.open("/help", "_blank")}>
          <FaQuestionCircle />
        </button>
      </div>
  
      {/* Hidden audio player */}
      <audio controls style={{ display: "none" }}>
        <source src={`./audio/${artist.spotify_link}.mp3`} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
  
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
        <button onClick={playPreview} className="hint-button">
          Predvajaj glasbo
        </button>
        <button onClick={toggleProfilePic} className="hint-button">
          Prikaži sliko
        </button>
      </div>
  
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
        <div key={index} className="guessed-artist">
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
              Žanri: {guessed.artist_genre}
            </div>
            <div className="attribute-box">
              Mesto izvora: {guessed.city_of_origin}
            </div>
          </div>
        </div>
      ))}
  
      <p className="besedilo1">Poišči današnjega izvajalca</p>
      <p className="besedilo1">Začneš tako, da vpišeš ime glasbenega izvajalca ali skupine</p>
  
      <p>{message}</p>
    </div>
  );
}

export default App;