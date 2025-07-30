const express = require("express");
const router = express.Router();
const passport = require("passport");
const Song = require("../models/Song");
const User = require("../models/User");
const mm = require('music-metadata');

// Helper function to get audio duration from URL
const getAudioDuration = async (audioUrl) => {
  try {
    const metadata = await mm.fetchFromUrl(audioUrl);
    return Math.round(metadata.format.duration || 0);
  } catch (error) {
    console.error('Error getting audio duration:', error);
    return 0; // Default duration if extraction fails
  }
};

router.post(
  "/create",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ err: "Unauthorized. User not found." });
      }

      const { name, thumbnail, track } = req.body;

      if (!name || !thumbnail || !track) {
        return res
          .status(400)
          .json({ err: "Insufficient details to create song." });
      }

      // Get audio duration
      const duration = await getAudioDuration(track);

      const artist = req.user._id;
      const songDetails = { name, thumbnail, track, artist, duration };

      const createdSong = await Song.create(songDetails);
      return res.status(200).json(createdSong);
    } catch (error) {
      console.error("Error creating song:", error);
      return res.status(500).json({ err: "Failed to create song", details: error.message });
    }
  }
);


// Get route to get all songs I have published.
router.get(
  "/get/mysongs",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    // We need to get all songs where artist id == currentUser._id
    const songs = await Song.find({ artist: req.user._id }).populate("artist");
    return res.status(200).json({ data: songs });
  }
);

// Get route to get all songs any artist has published
// I will send the artist id and I want to see all songs that artist has published.
router.get(
  "/get/artist/:artistId",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { artistId } = req.params;
    // We can check if the artist does not exist
    const artist = await User.findOne({ _id: artistId });
    // ![] = false
    // !null = true
    // !undefined = true
    if (!artist) {
      return res.status(301).json({ err: "Artist does not exist" });
    }

    const songs = await Song.find({ artist: artistId });
    return res.status(200).json({ data: songs });
  }
);

// Get route to get a single song by name
router.get(
  "/get/songname/:songName",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { songName } = req.params;

    // name:songName --> exact name matching. Vanilla, Vanila
    // Pattern matching instead of direct name matching.
    const songs = await Song.find({ name: songName }).populate("artist");
    return res.status(200).json({ data: songs });
  }
);

// Demo data for college presentation
router.post(
  "/create-demo-data",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const demoSongs = [
        {
          name: "Bohemian Rhapsody",
          thumbnail: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500",
          track: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
        },
        {
          name: "Shape of You",
          thumbnail: "https://images.unsplash.com/photo-1571974599782-87624638275c?w=500",
          track: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
        },
        {
          name: "Blinding Lights",
          thumbnail: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=500",
          track: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
        },
        {
          name: "Watermelon Sugar",
          thumbnail: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500",
          track: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3"
        },
        {
          name: "Bad Guy",
          thumbnail: "https://images.unsplash.com/photo-1571974599782-87624638275c?w=500",
          track: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3"
        },
        {
          name: "Someone Like You",
          thumbnail: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=500",
          track: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3"
        },
        {
          name: "Levitating",
          thumbnail: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500",
          track: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3"
        },
        {
          name: "Stay",
          thumbnail: "https://images.unsplash.com/photo-1571974599782-87624638275c?w=500",
          track: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3"
        }
      ];

      const artist = req.user._id;
      const createdSongs = [];

      for (const songData of demoSongs) {
        const songDetails = { 
          ...songData, 
          artist,
          isDemo: true  // Add this flag
        };
        const createdSong = await Song.create(songDetails);
        createdSongs.push(createdSong);
      }

      return res.status(200).json({
        message: `Demo ready! Created ${createdSongs.length} popular songs`,
        songs: createdSongs
      });
    } catch (error) {
      return res.status(500).json({ err: "Failed to create demo data" });
    }
  }
);

module.exports = router;
