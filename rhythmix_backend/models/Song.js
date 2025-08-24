const mongoose = require("mongoose");
// How to create a model
// Step 1 :require mongoose
// Step 2 :Create a mongoose schema (structure of a user)
// Step 3 : Create a model

const Song = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    thumbnail: {
        type: String,
        required: true,
    },
    track: {
        type: String,
        required: true,
    },
    artist: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: false, // Allow external songs without local artist
    },
    duration: {
        type: Number, // Duration in seconds
        default: 0,
    },
    // External API integration fields
    source: {
        type: String,
        enum: ['local', 'spotify', 'lastfm'],
        default: 'local'
    },
    external_id: {
        type: String, // Spotify ID, Last.fm mbid, etc.
        required: false
    },
    external_artist_name: {
        type: String, // Artist name from external service
        required: false
    },
    external_artist_id: {
        type: String, // External artist ID
        required: false
    },
    album: {
        type: String,
        required: false
    },
    preview_url: {
        type: String, // Spotify preview URL
        required: false
    },
    external_url: {
        type: String, // Link to external service
        required: false
    },
    genres: [{
        type: String
    }],
    popularity: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    release_date: {
        type: Date,
        required: false
    },
    tags: [{
        type: String
    }],
    playcount: {
        type: Number,
        default: 0
    },
    listeners: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true // Add createdAt and updatedAt
});

const SongModel = mongoose.model("Song", Song);

module.exports = SongModel;
