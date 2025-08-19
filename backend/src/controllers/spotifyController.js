const helper = require('../utils/helper');
const querystring = require('querystring');
const spotifyService = require('../services/spotifyService');
const queueService = require('../services/queueService');
const RoomController = require('../controllers/roomController');
const express = require('express');
const app = express();

let didFetchQueue = false;

/*
*	authenticateUser - Handles the get request for action /spotify-auth
*
*	Begins the authentication cycle and redirects user to spotify account
*	sign-in/sign-up page so they can link their account with our app
*
*/
const authenticateUser = async (req, res) => {
	const user = req.params.userid;

	// Scopes - the permissions we're asking the user to grant us.
	const scopes = "user-read-email user-library-read user-read-recently-played user-top-read playlist-read-private playlist-read-collaborative playlist-modify-public user-read-currently-playing user-read-playback-state app-remote-control streaming"; // Adjust scopes as needed

	// State - gives us a way to verify the request/response/callback
	var state = helper.generateRandomString(16);

	const result = await spotifyService.authenticateUser(res, scopes, state, user);
};

/*
*	getUserAuthorization - Handles the callback from /spotify-auth-callback
*
*	Collects the authentication code after the user has signed in and requests
*	the access token based on the users credentials
*/
const getUserAuthorization = async (req, res) => {
	// Variables to store the authentication code and state given in auth	
	var code = req.query.code || null;
	var state = req.query.state || null;

	// Calls the spotify service which redirects to collect user account info
	spotifyService.getUserAuthorization(res, code, state);
	// Does not return anything since it is redirected from this point
}

const refreshToken = async (req, res) => {
	const userid = req.params.userid;
	console.log(userid);
	const result = spotifyService.refreshToken(userid);
}

/**
 * Retrieves a Spotify token.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves with the token.
 */
const getToken = async (req, res) => {
	const userid = req.params.userid;
	const result = spotifyService.getToken(userid);
	res.status(200).json(result);
}

/**
 * Searches for songs based on the provided input.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the search is complete.
 */
const songSearch = async (req, res) => {
	var input = req.query.input || null;
	var roomId = req.query.roomId || null;
	try {
		const token = await RoomController.getSpotifyAccessToken(roomId);
		const results = await spotifyService.songSearchWithToken(input, await token.access_token)
		res.json(results); // Send the JSON response to the client
	} catch (error) {
		console.error('Error:', error);
		res.status(500).json({ error: 'Internal Server Error' });
	}
}

/**
 * Searches for a song using the provided input and Spotify access token.
 * @param {string} input - The search input for the song.
 * @param {string} token - The Spotify access token.
 * @returns {Promise<any>} - A promise that resolves to the search results.
 */
const songSearchWithToken = async (input, token) => {
	try {
		// const token = await RoomController.getSpotifyAccessToken(user);
		const results = await spotifyService.songSearch(input, token);
		return results;
	} catch (error) {
		console.error('Error:', error);
	}
}

/*
*	genreSearch - queries spotify api for a list of genres
*
*/
const getGenre = async (req, res) => {
	//var input = req.query || null;
	try {
		const results = await spotifyService.getGenre();
		//console.log(results)
		res.json(results); // Send the JSON response to the client
	} catch (error) {
		console.error('Error:', error);
		res.status(500).json({ error: 'Internal Server Error' });
	}
}

/**
 * Plays a song based on the currently playing song in the queue.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} The result of playing the song.
 */
const playSong = async (req, res) => {
	// const trackID = req.query.trackID;
	const song = await spotifyService.getPlaybackState();
	const result = await spotifyService.playSong(song.songID);
	res.status(200).json(result);
}

/**
 * Pauses the currently playing song.
 * 
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} The result of pausing the song.
*/
const pauseSong = async (req, res) => {
	const result = await spotifyService.pauseSong();
	res.status(200).json(result);
}

/**
 * Skips the current song.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} - The result of skipping the song.
 */
const skipSong = async (req, res) => {
	const result = await spotifyService.skipSong();
	res.status(200).json(result);
}


/**
 * Retrieves the playback device from Spotify.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves with the playback device information.
 */
const getPlaybackDevice = async (req, res) => {
	const result = await spotifyService.getPlaybackDevice();
	res.status(200).json({playbackDevice: result});
}

/**
 * Sets the playback device for Spotify.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.body - The request body.
 * @param {string} req.body.deviceID - The ID of the device to set as the playback device.
 * @param {Object} res - The response object.
 * @returns {Promise<Object>} The result of setting the playback device.
 */
const setPlaybackDevice = async (req, res) => {
	console.log(req.body.deviceID)
	const result = spotifyService.setPlaybackDevice(req.body.deviceID);
	return res.status(200).json(result);
}

/**
 * Retrieves the available devices from Spotify.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves with the JSON response containing the available devices.
 */
const getAvailableDevices = async (req, res) => {
	const result = await spotifyService.getAvailableDevices();
	res.status(200).json(result);
}

/**
 * Retrieves the user's playlists from Spotify.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves with the JSON response containing the user's playlists.
 */
const getUserPlaylists = async (req, res) => {
	const user = req.params.userid;

	const result = await spotifyService.getUserPlaylists(user);
	res.status(200).json(result)
}

/**
 * Retrieves the user queue from Spotify.
 * 
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the user queue is retrieved.
 * @throws {Error} - If there is an error retrieving the user queue.
 */
const getUserQueue = async (req, res) => {
	try {
		if (!didFetchQueue){
			const results = await spotifyService.getUserQueue()
				if (results.error == null){
					didFetchQueue = true;
					return res.status(200).json(results); // Send the JSON response to the client
				}else {
					res.status(500).json({ error: 'Internal Server Error' });
				}
		}else{
			res.status(500).json({ error: 'Already Fetched Queue' });
		}
	} catch (error) {
		console.error('Error:', error);
		res.status(500).json({ error: 'Internal Server Error' });
	}
}

/**
 * Retrieves the playback state from Spotify.
 * 
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the playback state is retrieved.
 */
const getPlaybackState = async (req, res) => {
	try {
		const results = await spotifyService.getPlaybackState();
		res.status(200).json(results)
	}catch (error){
		console.error(error);
		res.status(500).json({error: error})
	}
}

/**
 * Adds a track to the queue.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the track is added to the queue.
 * @throws {Error} - If there is an error adding the track to the queue.
 */
const addTrackToQueue = async (req, res) => {
	try {
		const track = req.body.track
		console.log(track);
		const results = await spotifyService.addTrackToQueue(track);
		res.status(200).json(results)
	}catch (error){
		console.error(error);
		res.status(500).json({error: error})
	}
}

/**
 * Retrieves the currently playing song from Spotify.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the currently playing song is retrieved.
 */
const getCurrentlyPlaying = async (req, res) => {
	try {
		const song = await spotifyService.getCurrentlyPlaying();
		res.status(200).json(song);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: error });
	}
};



module.exports = {
	authenticateUser,
	getUserAuthorization,
	refreshToken,
	songSearch,
	songSearchWithToken,
	getGenre,
	getToken,
	playSong,
	pauseSong,
	getPlaybackDevice,
	setPlaybackDevice,
	getAvailableDevices,
	getUserPlaylists,
	getUserQueue,
	getPlaybackState,
	addTrackToQueue,
	skipSong,
	getCurrentlyPlaying
}