import { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa"; // Import search icon
import artists from "./data/data.json";
import "./styles.css";

function App() {
  const [artist, setArtist] = useState(null);
  const [guess, setGuess] = useState("");
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredArtists, setFilteredArtists] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    setArtist(artists[Math.floor(Math.random() * artists.length)]);
  }, []);

  useEffect(() => {
    if (searchQuery) {
      // Filter artists based on the search query
      const filtered = artists
        .filter((a) =>
          a.artist_name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 10); // Limit to 10 results
      setFilteredArtists(filtered);
      setShowDropdown(true); // Show dropdown when there's a query
    } else {
      setFilteredArtists([]); // Clear results if query is empty
      setShowDropdown(false); // Hide dropdown
    }
  }, [searchQuery]);

  const handleArtistSelect = (selectedArtist) => {
    setGuess(selectedArtist); // Set the selected artist as the guess
    setSearchQuery(selectedArtist); // Populate the search bar with the selected artist
    setShowDropdown(false); // Hide the dropdown
  };

  const checkGuess = () => {
    if (guess.toLowerCase() === artist.artist_name.toLowerCase()) {
      setMessage("✅ Correct!");
    } else {
      setMessage("❌ Try again!");
    }
  };

  if (!artist) return <h1>Loading...</h1>;

  return (
    <div className="app">
      <img src="/image/drawing.png" alt="Slovenian Spotle Logo" className="logo" />

      <audio controls>
        <source src={`/audio/${artist.spotify_link}.mp3`} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>

      {/* Search Input Container */}
      <div className="input-container">
        <input
          type="text"
          placeholder="Search for an artist..."
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

      <button onClick={checkGuess}>Submit</button>
      <p>{message}</p>
    </div>
  );
}

export default App;