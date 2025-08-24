const axios = require('axios');
const NodeCache = require('node-cache');

// Cache for Spotify access token (expires in 1 hour)
const tokenCache = new NodeCache({ stdTTL: 3600 });

class SpotifyService {
  constructor() {
    this.clientId = process.env.SPOTIFY_CLIENT_ID;
    this.clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    this.baseURL = 'https://api.spotify.com/v1';
  }

  // Get access token using client credentials flow
  async getAccessToken() {
    const cachedToken = tokenCache.get('spotify_token');
    if (cachedToken) {
      return cachedToken;
    }

    try {
      const response = await axios.post('https://accounts.spotify.com/api/token', 
        'grant_type=client_credentials', {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`
        }
      });

      const token = response.data.access_token;
      tokenCache.set('spotify_token', token);
      return token;
    } catch (error) {
      console.error('Error getting Spotify access token:', error.response?.data || error.message);
      throw new Error('Failed to authenticate with Spotify');
    }
  }

  // Search for tracks
  async searchTracks(query, limit = 20) {
    try {
      const token = await this.getAccessToken();
      const response = await axios.get(`${this.baseURL}/search`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params: {
          q: query,
          type: 'track',
          limit: limit,
          market: 'US'
        }
      });

      return response.data.tracks.items.map(track => ({
        id: track.id,
        name: track.name,
        artist: track.artists[0].name,
        artistId: track.artists[0].id,
        album: track.album.name,
        thumbnail: track.album.images[0]?.url || null,
        duration: Math.round(track.duration_ms / 1000),
        preview_url: track.preview_url,
        spotify_id: track.id,
        external_url: track.external_urls.spotify,
        source: 'spotify'
      }));
    } catch (error) {
      console.error('Error searching Spotify tracks:', error.response?.data || error.message);
      throw new Error('Failed to search tracks on Spotify');
    }
  }

  // Get track by ID
  async getTrack(trackId) {
    try {
      const token = await this.getAccessToken();
      const response = await axios.get(`${this.baseURL}/tracks/${trackId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const track = response.data;
      return {
        id: track.id,
        name: track.name,
        artist: track.artists[0].name,
        artistId: track.artists[0].id,
        album: track.album.name,
        thumbnail: track.album.images[0]?.url || null,
        duration: Math.round(track.duration_ms / 1000),
        preview_url: track.preview_url,
        spotify_id: track.id,
        external_url: track.external_urls.spotify,
        source: 'spotify'
      };
    } catch (error) {
      console.error('Error getting Spotify track:', error.response?.data || error.message);
      throw new Error('Failed to get track from Spotify');
    }
  }

  // Get recommendations based on seed tracks, artists, or genres
  async getRecommendations(options = {}) {
    try {
      const token = await this.getAccessToken();
      const params = {
        limit: options.limit || 20,
        market: 'US'
      };

      if (options.seed_tracks) params.seed_tracks = options.seed_tracks.join(',');
      if (options.seed_artists) params.seed_artists = options.seed_artists.join(',');
      if (options.seed_genres) params.seed_genres = options.seed_genres.join(',');

      const response = await axios.get(`${this.baseURL}/recommendations`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params: params
      });

      return response.data.tracks.map(track => ({
        id: track.id,
        name: track.name,
        artist: track.artists[0].name,
        artistId: track.artists[0].id,
        album: track.album.name,
        thumbnail: track.album.images[0]?.url || null,
        duration: Math.round(track.duration_ms / 1000),
        preview_url: track.preview_url,
        spotify_id: track.id,
        external_url: track.external_urls.spotify,
        source: 'spotify'
      }));
    } catch (error) {
      console.error('Error getting Spotify recommendations:', error.response?.data || error.message);
      throw new Error('Failed to get recommendations from Spotify');
    }
  }

  // Get available genres for seeding recommendations
  async getGenres() {
    try {
      const token = await this.getAccessToken();
      const response = await axios.get(`${this.baseURL}/recommendations/available-genre-seeds`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return response.data.genres;
    } catch (error) {
      console.error('Error getting Spotify genres:', error.response?.data || error.message);
      throw new Error('Failed to get genres from Spotify');
    }
  }

  // Search for artists
  async searchArtists(query, limit = 20) {
    try {
      const token = await this.getAccessToken();
      const response = await axios.get(`${this.baseURL}/search`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params: {
          q: query,
          type: 'artist',
          limit: limit
        }
      });

      return response.data.artists.items.map(artist => ({
        id: artist.id,
        name: artist.name,
        genres: artist.genres,
        popularity: artist.popularity,
        followers: artist.followers.total,
        thumbnail: artist.images[0]?.url || null,
        spotify_id: artist.id,
        external_url: artist.external_urls.spotify,
        source: 'spotify'
      }));
    } catch (error) {
      console.error('Error searching Spotify artists:', error.response?.data || error.message);
      throw new Error('Failed to search artists on Spotify');
    }
  }

  // Get artist's top tracks
  async getArtistTopTracks(artistId) {
    try {
      const token = await this.getAccessToken();
      const response = await axios.get(`${this.baseURL}/artists/${artistId}/top-tracks`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params: {
          market: 'US'
        }
      });

      return response.data.tracks.map(track => ({
        id: track.id,
        name: track.name,
        artist: track.artists[0].name,
        artistId: track.artists[0].id,
        album: track.album.name,
        thumbnail: track.album.images[0]?.url || null,
        duration: Math.round(track.duration_ms / 1000),
        preview_url: track.preview_url,
        spotify_id: track.id,
        external_url: track.external_urls.spotify,
        source: 'spotify'
      }));
    } catch (error) {
      console.error('Error getting artist top tracks:', error.response?.data || error.message);
      throw new Error('Failed to get artist top tracks from Spotify');
    }
  }
}

module.exports = new SpotifyService();