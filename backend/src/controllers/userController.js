const querystring = require('querystring');
const userService = require('../services/userService');
const dbController = require('./dbController');
var express = require('express');
var app = express();

/**
 * Retrieves the services associated with a user.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves with the response.
 */
const getUserServices = async (req, res) => {
	// Get id from url param
	const user = req.params.userid;
	
	const result = await userService.getUserServices(user);

	// Send info about connections
	res.status(result.status).json(result);
}

// Does nothing as profiles (i.e. profile pictures) are not supported
const getUserProfile= (req, res) => {

	// Fetch username
	const response = userService.getUserProfile()

	// Return response
}

/**
 * Updates the Spotify token for the user.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the token is updated.
 */
const updateSpotifyToken = async (req, res) => {
	const result = await dbController.updateSpotifyAccount();

	if (result.error == null){
		res.status(result.status).json(result);
	}else{
		res.status(result.status).json(result);
	}
}

/**
 * Retrieves the Spotify token.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the token is retrieved.
 */
const getSpotifyToken = async (req, res) => {
	const result = await dbController.getSpotifyAccount();

	if (result.error == null){
		res.status(result.status).json(result);
	}else{
		res.status(result.status).json(result);
	}
}

/**
 * Retrieves the rooms associated with a user.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the rooms are retrieved.
 */
const getUserRooms = async (req, res) => {
	const userID = req.params.userid;

	const rooms = await dbController.getUserRooms(userID);

	if (rooms){
		res.status(rooms.status).json(rooms)
	}
}

module.exports = {
	getUserServices,
	getUserProfile,
	updateSpotifyToken,
	getSpotifyToken,
	getUserRooms
}