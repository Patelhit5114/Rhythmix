const axios = require('axios');
const NodeCache = require('node-cache');

// Cache for Last.fm data (expires in 30 minutes)
const dataCache = new NodeCache({ stdTTL: 1800 });

class LastfmService {
  constructor() {
    this.apiKey = process.env.LASTFM_API_KEY;
    this.baseURL = 'https://ws.audioscrobbler.com/2.0/';
  }

  // Get similar tracks
  async getSimilarTracks(artist, track, limit = 20) {
    const cacheKey = `similar_${artist}_${track}_${limit}`;
    const cached = dataCache.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(this.baseURL, {
        params: {
          method: 'track.getsimilar',
          artist: artist,
          track: track,
          api_key: this.apiKey,
          format: 'json',
          limit: limit
        }
      });

      if (response.data.error) {
        throw new Error(response.data.message);
      }

      const tracks = response.data.similartracks?.track || [];
      const similarTracks = (Array.isArray(tracks) ? tracks : [tracks])
        .filter(t => t && t.name && t.artist)
        .map(track => ({
          name: track.name,
          artist: track.artist?.name || track.artist,
          mbid: track.mbid,
          match: parseFloat(track.match || 0),
          url: track.url,
          source: 'lastfm'
        }));

      dataCache.set(cacheKey, similarTracks);
      return similarTracks;
    } catch (error) {
      console.error('Error getting similar tracks from Last.fm:', error.response?.data || error.message);
      throw new Error('Failed to get similar tracks from Last.fm');
    }
  }

  // Get similar artists
  async getSimilarArtists(artist, limit = 20) {
    const cacheKey = `similar_artist_${artist}_${limit}`;
    const cached = dataCache.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(this.baseURL, {
        params: {
          method: 'artist.getsimilar',
          artist: artist,
          api_key: this.apiKey,
          format: 'json',
          limit: limit
        }
      });

      if (response.data.error) {
        throw new Error(response.data.message);
      }

      const artists = response.data.similarartists?.artist || [];
      const similarArtists = (Array.isArray(artists) ? artists : [artists])
        .filter(a => a && a.name)
        .map(artist => ({
          name: artist.name,
          mbid: artist.mbid,
          match: parseFloat(artist.match || 0),
          url: artist.url,
          image: artist.image?.[2]?.['#text'] || null,
          source: 'lastfm'
        }));

      dataCache.set(cacheKey, similarArtists);
      return similarArtists;
    } catch (error) {
      console.error('Error getting similar artists from Last.fm:', error.response?.data || error.message);
      throw new Error('Failed to get similar artists from Last.fm');
    }
  }

  // Get track info
  async getTrackInfo(artist, track) {
    const cacheKey = `track_info_${artist}_${track}`;
    const cached = dataCache.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(this.baseURL, {
        params: {
          method: 'track.getinfo',
          artist: artist,
          track: track,
          api_key: this.apiKey,
          format: 'json'
        }
      });

      if (response.data.error) {
        throw new Error(response.data.message);
      }

      const trackData = response.data.track;
      if (!trackData) return null;

      const trackInfo = {
        name: trackData.name,
        artist: trackData.artist?.name || artist,
        album: trackData.album?.title,
        duration: parseInt(trackData.duration) || 0,
        playcount: parseInt(trackData.playcount) || 0,
        listeners: parseInt(trackData.listeners) || 0,
        mbid: trackData.mbid,
        url: trackData.url,
        tags: trackData.toptags?.tag?.map(tag => tag.name) || [],
        wiki: trackData.wiki?.summary,
        source: 'lastfm'
      };

      dataCache.set(cacheKey, trackInfo);
      return trackInfo;
    } catch (error) {
      console.error('Error getting track info from Last.fm:', error.response?.data || error.message);
      throw new Error('Failed to get track info from Last.fm');
    }
  }

  // Get artist info
  async getArtistInfo(artist) {
    const cacheKey = `artist_info_${artist}`;
    const cached = dataCache.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(this.baseURL, {
        params: {
          method: 'artist.getinfo',
          artist: artist,
          api_key: this.apiKey,
          format: 'json'
        }
      });

      if (response.data.error) {
        throw new Error(response.data.message);
      }

      const artistData = response.data.artist;
      if (!artistData) return null;

      const artistInfo = {
        name: artistData.name,
        mbid: artistData.mbid,
        url: artistData.url,
        image: artistData.image?.[3]?.['#text'] || null,
        playcount: parseInt(artistData.stats?.playcount) || 0,
        listeners: parseInt(artistData.stats?.listeners) || 0,
        tags: artistData.tags?.tag?.map(tag => tag.name) || [],
        bio: artistData.bio?.summary,
        similar: artistData.similar?.artist?.slice(0, 5).map(a => a.name) || [],
        source: 'lastfm'
      };

      dataCache.set(cacheKey, artistInfo);
      return artistInfo;
    } catch (error) {
      console.error('Error getting artist info from Last.fm:', error.response?.data || error.message);
      throw new Error('Failed to get artist info from Last.fm');
    }
  }

  // Get top tags for genre discovery
  async getTopTags(limit = 50) {
    const cacheKey = `top_tags_${limit}`;
    const cached = dataCache.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(this.baseURL, {
        params: {
          method: 'tag.getTopTags',
          api_key: this.apiKey,
          format: 'json'
        }
      });

      if (response.data.error) {
        throw new Error(response.data.message);
      }

      const tags = response.data.toptags?.tag || [];
      const topTags = (Array.isArray(tags) ? tags : [tags])
        .slice(0, limit)
        .map(tag => ({
          name: tag.name,
          count: parseInt(tag.count) || 0,
          reach: parseInt(tag.reach) || 0,
          source: 'lastfm'
        }));

      dataCache.set(cacheKey, topTags);
      return topTags;
    } catch (error) {
      console.error('Error getting top tags from Last.fm:', error.response?.data || error.message);
      throw new Error('Failed to get top tags from Last.fm');
    }
  }

  // Get top tracks by tag/genre
  async getTopTracksByTag(tag, limit = 20) {
    const cacheKey = `top_tracks_tag_${tag}_${limit}`;
    const cached = dataCache.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(this.baseURL, {
        params: {
          method: 'tag.gettoptracks',
          tag: tag,
          api_key: this.apiKey,
          format: 'json',
          limit: limit
        }
      });

      if (response.data.error) {
        throw new Error(response.data.message);
      }

      const tracks = response.data.tracks?.track || [];
      const topTracks = (Array.isArray(tracks) ? tracks : [tracks])
        .filter(t => t && t.name && t.artist)
        .map(track => ({
          name: track.name,
          artist: track.artist?.name || track.artist,
          mbid: track.mbid,
          rank: parseInt(track['@attr']?.rank) || 0,
          url: track.url,
          image: track.image?.[2]?.['#text'] || null,
          source: 'lastfm'
        }));

      dataCache.set(cacheKey, topTracks);
      return topTracks;
    } catch (error) {
      console.error('Error getting top tracks by tag from Last.fm:', error.response?.data || error.message);
      throw new Error('Failed to get top tracks by tag from Last.fm');
    }
  }

  // Search tracks
  async searchTracks(query, limit = 20) {
    try {
      const response = await axios.get(this.baseURL, {
        params: {
          method: 'track.search',
          track: query,
          api_key: this.apiKey,
          format: 'json',
          limit: limit
        }
      });

      if (response.data.error) {
        throw new Error(response.data.message);
      }

      const tracks = response.data.results?.trackmatches?.track || [];
      return (Array.isArray(tracks) ? tracks : [tracks])
        .filter(t => t && t.name && t.artist)
        .map(track => ({
          name: track.name,
          artist: track.artist,
          mbid: track.mbid,
          url: track.url,
          image: track.image?.[2]?.['#text'] || null,
          listeners: parseInt(track.listeners) || 0,
          source: 'lastfm'
        }));
    } catch (error) {
      console.error('Error searching tracks on Last.fm:', error.response?.data || error.message);
      throw new Error('Failed to search tracks on Last.fm');
    }
  }
}

module.exports = new LastfmService();