const express = require("express");
const router = express.Router();
const passport = require("passport");
const Song = require("../models/Song");
const UserPreferences = require("../models/UserPreferences");
const spotifyService = require("../services/spotifyService");
const lastfmService = require("../services/lastfmService");
const recommendationService = require("../services/recommendationService");

// Search songs across all external APIs
router.get(
  "/search",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const { q, limit = 20, source } = req.query;
      
      if (!q) {
        return res.status(400).json({ err: "Search query is required" });
      }

      let results = [];

      if (!source || source === 'all') {
        // Search across all sources
        results = await recommendationService.searchSongs(q, parseInt(limit));
      } else if (source === 'spotify') {
        // Search only Spotify
        results = await spotifyService.searchTracks(q, parseInt(limit));
      } else if (source === 'lastfm') {
        // Search only Last.fm
        results = await lastfmService.searchTracks(q, parseInt(limit));
      } else if (source === 'local') {
        // Search only local database
        const localResults = await Song.find({
          $or: [
            { name: { $regex: q, $options: 'i' } },
            { external_artist_name: { $regex: q, $options: 'i' } },
            { album: { $regex: q, $options: 'i' } }
          ]
        })
        .limit(parseInt(limit))
        .populate('artist');

        results = localResults.map(song => ({
          id: song._id,
          name: song.name,
          artist: song.external_artist_name || (song.artist ? song.artist.name : 'Unknown'),
          artistId: song.external_artist_id || song.artist?._id,
          album: song.album,
          thumbnail: song.thumbnail,
          duration: song.duration,
          preview_url: song.preview_url,
          external_url: song.external_url,
          source: song.source || 'local'
        }));
      }

      return res.status(200).json({ 
        data: results,
        total: results.length,
        query: q,
        source: source || 'all'
      });
    } catch (error) {
      console.error("Error searching songs:", error);
      return res.status(500).json({ 
        err: "Failed to search songs", 
        details: error.message 
      });
    }
  }
);

// Get personalized recommendations
router.get(
  "/recommendations",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const { limit = 20 } = req.query;
      const userId = req.user._id;

      const recommendations = await recommendationService.getPersonalizedRecommendations(
        userId, 
        parseInt(limit)
      );

      return res.status(200).json({
        data: recommendations,
        total: recommendations.length,
        personalized: true
      });
    } catch (error) {
      console.error("Error getting recommendations:", error);
      return res.status(500).json({
        err: "Failed to get recommendations",
        details: error.message
      });
    }
  }
);

// Get popular/trending songs
router.get(
  "/popular",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const { limit = 20, genre } = req.query;

      let popular = [];

      if (genre) {
        // Get popular songs by genre from Spotify
        try {
          popular = await spotifyService.getRecommendations({
            seed_genres: [genre],
            limit: parseInt(limit)
          });
        } catch (error) {
          console.warn("Spotify popular by genre failed:", error.message);
        }

        // Supplement with Last.fm if needed
        if (popular.length < limit) {
          try {
            const lastfmTracks = await lastfmService.getTopTracksByTag(genre, limit - popular.length);
            popular.push(...lastfmTracks);
          } catch (error) {
            console.warn("Last.fm popular by genre failed:", error.message);
          }
        }
      } else {
        // Get general popular recommendations
        popular = await recommendationService.getPopularRecommendations(parseInt(limit));
      }

      return res.status(200).json({
        data: popular,
        total: popular.length,
        genre: genre || 'all'
      });
    } catch (error) {
      console.error("Error getting popular songs:", error);
      return res.status(500).json({
        err: "Failed to get popular songs",
        details: error.message
      });
    }
  }
);

// Get available genres
router.get(
  "/genres",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      let genres = [];

      // Get Spotify genres
      try {
        const spotifyGenres = await spotifyService.getGenres();
        genres.push(...spotifyGenres.map(g => ({ name: g, source: 'spotify' })));
      } catch (error) {
        console.warn("Failed to get Spotify genres:", error.message);
      }

      // Get Last.fm top tags
      try {
        const lastfmTags = await lastfmService.getTopTags(50);
        genres.push(...lastfmTags.map(tag => ({ 
          name: tag.name, 
          source: 'lastfm', 
          count: tag.count 
        })));
      } catch (error) {
        console.warn("Failed to get Last.fm tags:", error.message);
      }

      // Remove duplicates
      const uniqueGenres = genres.reduce((acc, genre) => {
        const existing = acc.find(g => g.name.toLowerCase() === genre.name.toLowerCase());
        if (!existing) {
          acc.push(genre);
        }
        return acc;
      }, []);

      return res.status(200).json({
        data: uniqueGenres.slice(0, 100), // Limit to 100 genres
        total: uniqueGenres.length
      });
    } catch (error) {
      console.error("Error getting genres:", error);
      return res.status(500).json({
        err: "Failed to get genres",
        details: error.message
      });
    }
  }
);

// Add external song to local database
router.post(
  "/add-song",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const { external_id, source, name, artist, album, thumbnail, duration, preview_url, external_url, genres } = req.body;

      if (!external_id || !source || !name || !artist) {
        return res.status(400).json({ 
          err: "Missing required fields: external_id, source, name, artist" 
        });
      }

      // Check if song already exists
      const existingSong = await Song.findOne({ external_id, source });
      if (existingSong) {
        return res.status(200).json({ 
          message: "Song already exists in database",
          data: existingSong 
        });
      }

      // Create new song entry
      const songData = {
        name,
        external_artist_name: artist,
        album,
        thumbnail: thumbnail || 'https://via.placeholder.com/300x300?text=No+Image',
        track: preview_url || external_url || '#', // Placeholder for required field
        duration: duration || 0,
        source,
        external_id,
        preview_url,
        external_url,
        genres: genres || [],
        popularity: 0
      };

      const newSong = await Song.create(songData);

      return res.status(201).json({
        message: "Song added to database successfully",
        data: newSong
      });
    } catch (error) {
      console.error("Error adding external song:", error);
      return res.status(500).json({
        err: "Failed to add song",
        details: error.message
      });
    }
  }
);

// Track user interaction (listening, liking, etc.)
router.post(
  "/track-interaction",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const { song_id, action, play_duration, completed } = req.body;
      const userId = req.user._id;

      if (!song_id || !action) {
        return res.status(400).json({ 
          err: "Missing required fields: song_id, action" 
        });
      }

      switch (action) {
        case 'play':
          await recommendationService.updateUserPreferences(
            userId, 
            song_id, 
            play_duration || 0, 
            completed || false
          );
          break;

        case 'like':
          // Add to favorites in user preferences
          let userPrefs = await UserPreferences.findOne({ user: userId });
          if (!userPrefs) {
            userPrefs = new UserPreferences({ user: userId });
          }

          const song = await Song.findById(song_id);
          if (song && song.genres) {
            // Add genres to favorite genres
            for (const genre of song.genres) {
              if (!userPrefs.favorite_genres.includes(genre)) {
                userPrefs.favorite_genres.push(genre);
              }
            }
          }

          await userPrefs.save();
          break;

        case 'dislike':
          // Add to disliked songs
          let userPrefs2 = await UserPreferences.findOne({ user: userId });
          if (!userPrefs2) {
            userPrefs2 = new UserPreferences({ user: userId });
          }

          userPrefs2.disliked_songs.push({
            song_id: song_id,
            reason: 'user_dislike',
            disliked_at: new Date()
          });

          await userPrefs2.save();
          break;

        default:
          return res.status(400).json({ err: "Invalid action" });
      }

      return res.status(200).json({
        message: "Interaction tracked successfully",
        action: action
      });
    } catch (error) {
      console.error("Error tracking interaction:", error);
      return res.status(500).json({
        err: "Failed to track interaction",
        details: error.message
      });
    }
  }
);

// Get user preferences
router.get(
  "/preferences",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const userId = req.user._id;
      
      let userPrefs = await UserPreferences.findOne({ user: userId }).populate('listening_history.song_id');
      
      if (!userPrefs) {
        userPrefs = new UserPreferences({ user: userId });
        await userPrefs.save();
      }

      return res.status(200).json({
        data: userPrefs
      });
    } catch (error) {
      console.error("Error getting user preferences:", error);
      return res.status(500).json({
        err: "Failed to get user preferences",
        details: error.message
      });
    }
  }
);

// Update user preferences
router.put(
  "/preferences",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const userId = req.user._id;
      const updates = req.body;

      let userPrefs = await UserPreferences.findOne({ user: userId });
      if (!userPrefs) {
        userPrefs = new UserPreferences({ user: userId });
      }

      // Update allowed fields
      const allowedUpdates = [
        'favorite_genres', 
        'favorite_artists', 
        'recommendation_settings',
        'audio_preferences'
      ];

      for (const field of allowedUpdates) {
        if (updates[field] !== undefined) {
          userPrefs[field] = updates[field];
        }
      }

      await userPrefs.save();

      return res.status(200).json({
        message: "Preferences updated successfully",
        data: userPrefs
      });
    } catch (error) {
      console.error("Error updating user preferences:", error);
      return res.status(500).json({
        err: "Failed to update preferences",
        details: error.message
      });
    }
  }
);

module.exports = router;