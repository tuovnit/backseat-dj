const express = require('express');
const soundcloudController = require('../controllers/soundcloudController');
const router = express.Router();

// *********** Search Routes ***********
router.get('/search/track', soundcloudController.songSearch);

// *********** Recommendation(Genre Filter) Routes  ***********
router.get('/getGenres', soundcloudController.getGenre)

router.get('/play', soundcloudController.playSong);
router.get('/pause', soundcloudController.pauseSong);

router.get('/getTrack', soundcloudController.getTrackURL);
// Export router so it can be used
module.exports = router;