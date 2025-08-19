const helper = require('../utils/helper');
const querystring = require('querystring');
const soundcloudService = require('../services/soundcloudService');
const queueService = require('../services/queueService');
var express = require('express');
var app = express();

/*
*	songSearch - queries spotify api for a list of tracks based on the search input provided
*	by the user
*
*/
const songSearch = async (req, res) => {
	var input = req.query.input || null;
	var roomId = req.query.roomId || null;
	
	try {
		const results = await soundcloudService.songSearch(input, roomId);
		res.json(results); // Send the JSON response to the client
	} catch (error) {
		console.error('Error:', error);
		res.status(500).json({ error: 'Internal Server Error' });
    }
}

/*
*	genreSearch - queries spotify api for a list of genres
*
*/

const getGenre = async (req, res) => {
	try {
		const results = await soundcloudService.getGenre();
		//console.log(results)
		res.json(results); // Send the JSON response to the client
	} catch (error) {
		console.error('Error:', error);
		res.status(500).json({ error: 'Internal Server Error' });
	}


}
const getTrackURL = async (req, res) => {
	var songid = req.query.songid || null;
	var trackName = req.query.trackName || null;
	var duration = req.query.duration || null;
	var artist_name = req.query.artistName || null;
	try {
	    results = null
		//url = await queueService.getCurrentlyPlaying()
		//console.log(input)
		if(songid != null){
		 results = await soundcloudService.getTrackURL(songid, trackName, duration, artist_name);
		}
		res.json(results);
	} catch (error) {
		console.error('Error:', error);
		res.status(500).json({ error: 'Internal Server Error' });
	}


}


/**
 * Plays a song. (Ignore for now)
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} The result of playing the song.
 */
const playSong = async (req, res) => {
	// const trackID = req.query.trackID;
	//const song = queueService.getCurrentlyPlaying();
	//console.log("PLAY SONG:")
	//console.log(song)
	//const result = await soundcloudService.playSong(req);
	//console.log(result)
	//res.json(result);
}
/**
 * Pauses the currently playing song.
 * 
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} The result of pausing the song.
 */
const pauseSong = async (req, res) => {
	//const result = await soundcloudService.pauseSong();
	//res.json(result);
}

module.exports = {
	songSearch,
	getGenre,
	pauseSong,
	getTrackURL,
	playSong


}