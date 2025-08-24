import { useState, useEffect } from "react";
import LoggedInContainer from "../containers/LoggedInContainers";
import { Icon } from "@iconify/react";
import { makeAuthenticatedGETRequest, makeAuthenticatedPOSTRequest } from "../utils/serverHelpers";
import SingleSongCard from "../components/shared/SingleSongCard";

const Discover = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [popularSongs, setPopularSongs] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userPreferences, setUserPreferences] = useState(null);

  // Fetch initial data
  useEffect(() => {
    fetchRecommendations();
    fetchPopularSongs();
    fetchGenres();
    fetchUserPreferences();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const response = await makeAuthenticatedGETRequest("/external/recommendations?limit=15");
      setRecommendations(response.data || []);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    }
  };

  const fetchPopularSongs = async (genre = "") => {
    setIsLoading(true);
    try {
      const url = genre 
        ? `/external/popular?limit=15&genre=${encodeURIComponent(genre)}`
        : "/external/popular?limit=15";
      const response = await makeAuthenticatedGETRequest(url);
      setPopularSongs(response.data || []);
    } catch (error) {
      console.error("Error fetching popular songs:", error);
      setPopularSongs([]);
    }
    setIsLoading(false);
  };

  const fetchGenres = async () => {
    try {
      const response = await makeAuthenticatedGETRequest("/external/genres");
      const genreData = response.data || [];
      // Filter and limit genres for better UX
      const popularGenres = genreData
        .filter(g => g.name && g.name.length < 20) // Filter out very long genre names
        .slice(0, 50);
      setGenres(popularGenres);
    } catch (error) {
      console.error("Error fetching genres:", error);
    }
  };

  const fetchUserPreferences = async () => {
    try {
      const response = await makeAuthenticatedGETRequest("/external/preferences");
      setUserPreferences(response.data);
    } catch (error) {
      console.error("Error fetching user preferences:", error);
    }
  };

  const handleGenreSelect = (genreName) => {
    setSelectedGenre(genreName);
    fetchPopularSongs(genreName);
  };

  const trackInteraction = async (songId, action, playDuration = 0, completed = false) => {
    try {
      await makeAuthenticatedPOSTRequest("/external/track-interaction", {
        song_id: songId,
        action: action,
        play_duration: playDuration,
        completed: completed
      });
      
      // Refresh recommendations if user liked/disliked
      if (action === "like" || action === "dislike") {
        fetchRecommendations();
      }
    } catch (error) {
      console.error("Error tracking interaction:", error);
    }
  };

  const addToLibrary = async (song) => {
    try {
      await makeAuthenticatedPOSTRequest("/external/add-song", {
        external_id: song.spotify_id || song.id || song.name,
        source: song.source || 'external',
        name: song.name,
        artist: song.artist,
        album: song.album,
        thumbnail: song.thumbnail,
        duration: song.duration,
        preview_url: song.preview_url,
        external_url: song.external_url,
        genres: song.genres || []
      });
      
      // Track as liked
      trackInteraction(song.id, "like");
    } catch (error) {
      console.error("Error adding to library:", error);
    }
  };

  return (
    <LoggedInContainer curActiveScreen="discover">
      <div className="w-full py-6 space-y-8">
        
        {/* Header */}
        <div className="text-white">
          <h1 className="text-3xl font-bold mb-2">Discover Music</h1>
          <p className="text-gray-400">Personalized recommendations and trending songs from Spotify and Last.fm</p>
        </div>

        {/* Personalized Recommendations */}
        {recommendations.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-white text-xl font-semibold flex items-center">
                <Icon icon="material-symbols:recommend" className="text-green-500 mr-2" />
                Made for You
              </h2>
              <button 
                onClick={fetchRecommendations}
                className="text-green-500 hover:text-green-400 flex items-center text-sm"
              >
                <Icon icon="material-symbols:refresh" className="mr-1" />
                Refresh
              </button>
            </div>
            <div className="space-y-3">
              {recommendations.slice(0, 8).map((song, index) => (
                <div key={`rec-${song.id || index}`} className="flex items-center space-x-3">
                  <SingleSongCard
                    info={song}
                    playSound={() => trackInteraction(song.id, "play", 30, false)}
                    showSource={true}
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={() => trackInteraction(song.id, "like")}
                      className="text-gray-400 hover:text-green-500 transition-colors"
                      title="Like this song"
                    >
                      <Icon icon="material-symbols:thumb-up" className="text-lg" />
                    </button>
                    <button
                      onClick={() => trackInteraction(song.id, "dislike")}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      title="Not interested"
                    >
                      <Icon icon="material-symbols:thumb-down" className="text-lg" />
                    </button>
                    <button
                      onClick={() => addToLibrary(song)}
                      className="text-gray-400 hover:text-green-500 transition-colors"
                      title="Add to library"
                    >
                      <Icon icon="material-symbols:add-circle" className="text-lg" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Genre Selection */}
        <div className="space-y-4">
          <h2 className="text-white text-xl font-semibold">Popular by Genre</h2>
          <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
            <button
              onClick={() => handleGenreSelect("")}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${
                selectedGenre === ""
                  ? "bg-green-500 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              All Genres
            </button>
            {genres.map((genre, index) => (
              <button
                key={`genre-${index}`}
                onClick={() => handleGenreSelect(genre.name)}
                className={`px-4 py-2 rounded-full text-sm transition-colors ${
                  selectedGenre === genre.name
                    ? "bg-green-500 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                {genre.name}
                {genre.source === 'spotify' && (
                  <span className="ml-1 text-xs text-green-400">♫</span>
                )}
                {genre.source === 'lastfm' && genre.count && (
                  <span className="ml-1 text-xs text-red-400">({genre.count})</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Popular Songs */}
        <div className="space-y-4">
          <h2 className="text-white text-xl font-semibold">
            {selectedGenre ? `Popular ${selectedGenre} Songs` : "Popular Songs"}
          </h2>
          
          {isLoading ? (
            <div className="text-white text-center py-8">
              <Icon icon="eos-icons:loading" className="text-4xl mx-auto mb-2" />
              Loading popular songs...
            </div>
          ) : popularSongs.length > 0 ? (
            <div className="space-y-3">
              {popularSongs.map((song, index) => (
                <div key={`popular-${song.id || index}`} className="flex items-center space-x-3">
                  <SingleSongCard
                    info={song}
                    playSound={() => trackInteraction(song.id, "play", 30, false)}
                    showSource={true}
                  />
                  <button
                    onClick={() => addToLibrary(song)}
                    className="text-gray-400 hover:text-green-500 transition-colors"
                    title="Add to library"
                  >
                    <Icon icon="material-symbols:add-circle" className="text-lg" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-400 text-center py-8">
              No popular songs found for this genre.
            </div>
          )}
        </div>

        {/* User Stats (if available) */}
        {userPreferences && userPreferences.stats && (
          <div className="bg-gray-800 rounded-lg p-6 space-y-4">
            <h2 className="text-white text-xl font-semibold">Your Music Stats</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="space-y-1">
                <div className="text-2xl font-bold text-green-500">
                  {Math.floor(userPreferences.stats.total_listening_time / 3600)}h
                </div>
                <div className="text-gray-400 text-sm">Total Listening</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-blue-500">
                  {userPreferences.favorite_genres?.length || 0}
                </div>
                <div className="text-gray-400 text-sm">Favorite Genres</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-purple-500">
                  {userPreferences.listening_history?.length || 0}
                </div>
                <div className="text-gray-400 text-sm">Songs Played</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-orange-500">
                  {userPreferences.stats.most_played_genre || "N/A"}
                </div>
                <div className="text-gray-400 text-sm">Top Genre</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </LoggedInContainer>
  );
};

export default Discover;