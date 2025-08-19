const express = require('express');
const spotifyController = require('../controllers/spotifyController');

const router = express.Router();

// *********** Authentication Routes ***********
router.get('/:userid/spotify-auth', spotifyController.authenticateUser);
router.get('/spotify-auth-callback', spotifyController.getUserAuthorization);
router.get('/:userid/token', spotifyController.getToken);
router.get('/refresh', spotifyController.refreshToken)

// *********** Search Routes ***********
router.get('/search/track', spotifyController.songSearch);

// *********** Recommendation(Genre Filter) Routes  ***********
router.get('/getGenres', spotifyController.getGenre)


// *********** Playback control routes ***********
router.get('/play', spotifyController.playSong);
router.get('/pause', spotifyController.pauseSong);
router.get('/playback', spotifyController.getPlaybackDevice);
router.put('/playback', spotifyController.setPlaybackDevice);
router.get('/state', spotifyController.getPlaybackState);
router.get('/skip', spotifyController.skipSong);
router.get('/currently-playing', spotifyController.getCurrentlyPlaying);

// *********** Spotify Connection routes ***********
router.get('/devices', spotifyController.getAvailableDevices);
router.get('/:userID/playlists', spotifyController.getUserPlaylists);

// *********** Queue routes **********
router.get('/queue', spotifyController.getUserQueue);
router.post('/addsong', spotifyController.addTrackToQueue);

// Export router so it can be used
module.exports = router;