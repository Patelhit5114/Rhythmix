const mongoose = require("mongoose");

const UserPreferences = new mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },
    // Favorite genres
    favorite_genres: [{
        type: String,
        lowercase: true
    }],
    // Preferred artists
    favorite_artists: [{
        name: String,
        external_id: String,
        source: {
            type: String,
            enum: ['local', 'spotify', 'lastfm']
        }
    }],
    // Listening history for recommendations
    listening_history: [{
        song_id: {
            type: mongoose.Types.ObjectId,
            ref: "Song"
        },
        played_at: {
            type: Date,
            default: Date.now
        },
        play_duration: {
            type: Number, // Duration in seconds
            default: 0
        },
        completed: {
            type: Boolean,
            default: false
        }
    }],
    // Disliked songs (to avoid in recommendations)
    disliked_songs: [{
        song_id: {
            type: mongoose.Types.ObjectId,
            ref: "Song"
        },
        reason: String,
        disliked_at: {
            type: Date,
            default: Date.now
        }
    }],
    // Preferred audio features
    audio_preferences: {
        energy_min: {
            type: Number,
            min: 0,
            max: 1,
            default: 0
        },
        energy_max: {
            type: Number,
            min: 0,
            max: 1,
            default: 1
        },
        valence_min: {
            type: Number,
            min: 0,
            max: 1,
            default: 0
        },
        valence_max: {
            type: Number,
            min: 0,
            max: 1,
            default: 1
        },
        danceability_min: {
            type: Number,
            min: 0,
            max: 1,
            default: 0
        },
        danceability_max: {
            type: Number,
            min: 0,
            max: 1,
            default: 1
        },
        tempo_min: {
            type: Number,
            default: 50
        },
        tempo_max: {
            type: Number,
            default: 200
        }
    },
    // Recommendation settings
    recommendation_settings: {
        include_explicit: {
            type: Boolean,
            default: true
        },
        discovery_mode: {
            type: String,
            enum: ['conservative', 'balanced', 'adventurous'],
            default: 'balanced'
        },
        preferred_languages: [{
            type: String,
            lowercase: true
        }],
        max_song_length: {
            type: Number, // in seconds
            default: 600 // 10 minutes
        },
        min_song_length: {
            type: Number, // in seconds
            default: 30
        }
    },
    // Statistics for better recommendations
    stats: {
        total_listening_time: {
            type: Number, // in seconds
            default: 0
        },
        favorite_time_of_day: [{
            hour: {
                type: Number,
                min: 0,
                max: 23
            },
            count: {
                type: Number,
                default: 0
            }
        }],
        most_played_genre: String,
        average_song_length: {
            type: Number,
            default: 0
        }
    }
}, {
    timestamps: true
});

// Index for better performance
UserPreferences.index({ user: 1 });
UserPreferences.index({ "listening_history.played_at": -1 });

const UserPreferencesModel = mongoose.model("UserPreferences", UserPreferences);

module.exports = UserPreferencesModel;