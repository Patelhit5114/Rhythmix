const spotifyService = require('./spotifyService');
const lastfmService = require('./lastfmService');
const Song = require('../models/Song');
const UserPreferences = require('../models/UserPreferences');

class RecommendationService {
  // Get personalized recommendations for a user
  async getPersonalizedRecommendations(userId, limit = 20) {
    try {
      const userPrefs = await UserPreferences.findOne({ user: userId });
      
      if (!userPrefs) {
        // If no preferences exist, get popular tracks
        return await this.getPopularRecommendations(limit);
      }

      const recommendations = [];
      const targetCount = Math.ceil(limit / 3); // Distribute across different sources

      // 1. Get Spotify recommendations based on user preferences
      try {
        const spotifyRecs = await this.getSpotifyRecommendations(userPrefs, targetCount);
        recommendations.push(...spotifyRecs);
      } catch (error) {
        console.warn('Spotify recommendations failed:', error.message);
      }

      // 2. Get Last.fm similar tracks based on listening history
      try {
        const lastfmRecs = await this.getLastfmRecommendations(userPrefs, targetCount);
        recommendations.push(...lastfmRecs);
      } catch (error) {
        console.warn('Last.fm recommendations failed:', error.message);
      }

      // 3. Get local recommendations from database
      try {
        const localRecs = await this.getLocalRecommendations(userPrefs, targetCount);
        recommendations.push(...localRecs);
      } catch (error) {
        console.warn('Local recommendations failed:', error.message);
      }

      // Remove duplicates and filter based on user preferences
      const filteredRecs = this.filterAndDeduplicate(recommendations, userPrefs);
      
      // Shuffle and limit results
      return this.shuffleArray(filteredRecs).slice(0, limit);
      
    } catch (error) {
      console.error('Error getting personalized recommendations:', error);
      return await this.getPopularRecommendations(limit);
    }
  }

  // Get Spotify-based recommendations
  async getSpotifyRecommendations(userPrefs, limit) {
    const recommendations = [];

    // Use favorite genres as seeds
    if (userPrefs.favorite_genres && userPrefs.favorite_genres.length > 0) {
      const genreSeeds = userPrefs.favorite_genres.slice(0, 5); // Spotify allows max 5 seeds
      
      try {
        const spotifyRecs = await spotifyService.getRecommendations({
          seed_genres: genreSeeds,
          limit: limit
        });
        recommendations.push(...spotifyRecs);
      } catch (error) {
        console.warn('Spotify genre recommendations failed:', error.message);
      }
    }

    // Use favorite artists as seeds
    if (userPrefs.favorite_artists && userPrefs.favorite_artists.length > 0) {
      const artistSeeds = userPrefs.favorite_artists
        .filter(artist => artist.source === 'spotify')
        .map(artist => artist.external_id)
        .slice(0, 5);

      if (artistSeeds.length > 0) {
        try {
          const artistRecs = await spotifyService.getRecommendations({
            seed_artists: artistSeeds,
            limit: Math.ceil(limit / 2)
          });
          recommendations.push(...artistRecs);
        } catch (error) {
          console.warn('Spotify artist recommendations failed:', error.message);
        }
      }
    }

    return recommendations;
  }

  // Get Last.fm-based recommendations
  async getLastfmRecommendations(userPrefs, limit) {
    const recommendations = [];

    // Get similar tracks based on listening history
    if (userPrefs.listening_history && userPrefs.listening_history.length > 0) {
      const recentTracks = await Song.find({
        _id: { $in: userPrefs.listening_history.slice(-10).map(h => h.song_id) }
      });

      for (const track of recentTracks.slice(0, 3)) { // Use last 3 tracks
        try {
          const artistName = track.external_artist_name || track.artist;
          if (artistName && track.name) {
            const similarTracks = await lastfmService.getSimilarTracks(
              artistName, 
              track.name, 
              Math.ceil(limit / 3)
            );
            recommendations.push(...similarTracks);
          }
        } catch (error) {
          console.warn('Last.fm similar tracks failed for', track.name, error.message);
        }
      }
    }

    // Get tracks by favorite genres (using Last.fm tags)
    if (userPrefs.favorite_genres && userPrefs.favorite_genres.length > 0) {
      for (const genre of userPrefs.favorite_genres.slice(0, 2)) {
        try {
          const genreTracks = await lastfmService.getTopTracksByTag(genre, Math.ceil(limit / 4));
          recommendations.push(...genreTracks);
        } catch (error) {
          console.warn('Last.fm genre tracks failed for', genre, error.message);
        }
      }
    }

    return recommendations;
  }

  // Get local database recommendations
  async getLocalRecommendations(userPrefs, limit) {
    const recommendations = [];

    // Get popular songs from favorite genres
    if (userPrefs.favorite_genres && userPrefs.favorite_genres.length > 0) {
      const genreRecs = await Song.find({
        genres: { $in: userPrefs.favorite_genres },
        _id: { $nin: userPrefs.disliked_songs.map(d => d.song_id) }
      })
      .sort({ playcount: -1, popularity: -1 })
      .limit(limit)
      .populate('artist');

      recommendations.push(...genreRecs.map(song => this.formatLocalSong(song)));
    }

    // Get songs similar to user's listening history
    if (userPrefs.listening_history && userPrefs.listening_history.length > 0) {
      const likedSongs = await Song.find({
        _id: { $in: userPrefs.listening_history.map(h => h.song_id) }
      });

      const likedGenres = [...new Set(likedSongs.flatMap(song => song.genres))];
      
      if (likedGenres.length > 0) {
        const similarRecs = await Song.find({
          genres: { $in: likedGenres },
          _id: { 
            $nin: [
              ...userPrefs.listening_history.map(h => h.song_id),
              ...userPrefs.disliked_songs.map(d => d.song_id)
            ]
          }
        })
        .sort({ popularity: -1, createdAt: -1 })
        .limit(Math.ceil(limit / 2))
        .populate('artist');

        recommendations.push(...similarRecs.map(song => this.formatLocalSong(song)));
      }
    }

    return recommendations;
  }

  // Get popular recommendations (fallback)
  async getPopularRecommendations(limit = 20) {
    try {
      // Mix of popular tracks from different sources
      const recommendations = [];

      // Get Spotify popular tracks by genre
      const popularGenres = ['pop', 'rock', 'hip-hop', 'electronic', 'indie'];
      for (const genre of popularGenres.slice(0, 3)) {
        try {
          const genreRecs = await spotifyService.getRecommendations({
            seed_genres: [genre],
            limit: Math.ceil(limit / 3)
          });
          recommendations.push(...genreRecs);
        } catch (error) {
          console.warn('Popular Spotify recommendations failed:', error.message);
        }
      }

      // Get popular tracks from local database
      const localPopular = await Song.find({})
        .sort({ playcount: -1, popularity: -1 })
        .limit(Math.ceil(limit / 2))
        .populate('artist');

      recommendations.push(...localPopular.map(song => this.formatLocalSong(song)));

      return this.shuffleArray(recommendations).slice(0, limit);
    } catch (error) {
      console.error('Error getting popular recommendations:', error);
      return [];
    }
  }

  // Search songs across all sources
  async searchSongs(query, limit = 20) {
    const results = [];

    try {
      // Search Spotify
      const spotifyResults = await spotifyService.searchTracks(query, Math.ceil(limit / 2));
      results.push(...spotifyResults);
    } catch (error) {
      console.warn('Spotify search failed:', error.message);
    }

    try {
      // Search Last.fm
      const lastfmResults = await lastfmService.searchTracks(query, Math.ceil(limit / 4));
      results.push(...lastfmResults);
    } catch (error) {
      console.warn('Last.fm search failed:', error.message);
    }

    try {
      // Search local database
      const localResults = await Song.find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { external_artist_name: { $regex: query, $options: 'i' } },
          { album: { $regex: query, $options: 'i' } }
        ]
      })
      .limit(Math.ceil(limit / 4))
      .populate('artist');

      results.push(...localResults.map(song => this.formatLocalSong(song)));
    } catch (error) {
      console.warn('Local search failed:', error.message);
    }

    return this.filterAndDeduplicate(results, null).slice(0, limit);
  }

  // Update user preferences based on listening behavior
  async updateUserPreferences(userId, songId, playDuration, completed = false) {
    try {
      const song = await Song.findById(songId);
      if (!song) return;

      let userPrefs = await UserPreferences.findOne({ user: userId });
      if (!userPrefs) {
        userPrefs = new UserPreferences({ user: userId });
      }

      // Add to listening history
      userPrefs.listening_history.push({
        song_id: songId,
        played_at: new Date(),
        play_duration: playDuration,
        completed: completed
      });

      // Keep only last 100 entries
      if (userPrefs.listening_history.length > 100) {
        userPrefs.listening_history = userPrefs.listening_history.slice(-100);
      }

      // Update favorite genres based on listening patterns
      if (song.genres && song.genres.length > 0) {
        for (const genre of song.genres) {
          if (!userPrefs.favorite_genres.includes(genre)) {
            userPrefs.favorite_genres.push(genre);
          }
        }
      }

      // Update statistics
      userPrefs.stats.total_listening_time += playDuration;
      
      const currentHour = new Date().getHours();
      const hourStat = userPrefs.stats.favorite_time_of_day.find(h => h.hour === currentHour);
      if (hourStat) {
        hourStat.count += 1;
      } else {
        userPrefs.stats.favorite_time_of_day.push({ hour: currentHour, count: 1 });
      }

      await userPrefs.save();
    } catch (error) {
      console.error('Error updating user preferences:', error);
    }
  }

  // Helper functions
  filterAndDeduplicate(recommendations, userPrefs) {
    const seen = new Set();
    const filtered = [];

    for (const rec of recommendations) {
      // Create unique key based on name and artist
      const key = `${rec.name.toLowerCase()}-${(rec.artist || rec.external_artist_name || '').toLowerCase()}`;
      
      if (seen.has(key)) continue;
      seen.add(key);

      // Filter based on user preferences
      if (userPrefs) {
        // Skip disliked songs
        const isDisliked = userPrefs.disliked_songs.some(d => 
          d.song_id && d.song_id.toString() === rec._id?.toString()
        );
        if (isDisliked) continue;

        // Check song length preferences
        if (userPrefs.recommendation_settings) {
          const settings = userPrefs.recommendation_settings;
          if (rec.duration && (
            rec.duration < settings.min_song_length ||
            rec.duration > settings.max_song_length
          )) continue;
        }
      }

      filtered.push(rec);
    }

    return filtered;
  }

  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  formatLocalSong(song) {
    return {
      id: song._id,
      name: song.name,
      artist: song.external_artist_name || (song.artist ? song.artist.name : 'Unknown'),
      artistId: song.external_artist_id || song.artist?._id,
      album: song.album,
      thumbnail: song.thumbnail,
      duration: song.duration,
      preview_url: song.preview_url,
      external_url: song.external_url,
      source: song.source || 'local',
      genres: song.genres,
      popularity: song.popularity
    };
  }
}

module.exports = new RecommendationService();