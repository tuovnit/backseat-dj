const helper = require('../utils/helper');
const querystring = require('querystring');
const queueService = require('../services/queueService');
const Song = require('../models/song');
var express = require('express');

// ******* Queue Add/Remove *******

/**
 * Add a song to the queue.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves with the result of adding the song to the queue.
 */
const addSong = async (req, res) => {
	// Get song info from request
	const song = Song.Song.createFromRequestQuery(req.query);

	const result = await queueService.addSong(song);
	res.status(200).json(result);
}

/**
 * Removes a song from the queue.
 * 
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the song is removed.
 */
const removeSong = async (req, res) => {
	const songID = req.query.songID;
	console.log("Removing song " + songID);
	const result = await queueService.removeSong(songID);
	res.status(200).json(result);
}

/**
 * Retrieves the queue and sends it as a JSON response.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the response is sent.
 */
const getQueue = async (req, res) => {
	//console.log("Getting queue");
	const result = queueService.getQueue();
	res.status(200).json(result);
}

/**
 * Retrieves the next song from the queue.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves with the JSON response containing the next song.
 */
const getNext = async (req, res) => {
	//console.log("Fetching next song");
	const result = queueService.getNext();
	//console.log(result)
	res.status(200).json(result);
}

/**
 * Retrieves the currently playing song.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves with the JSON response containing the currently playing song.
 */
const getCurrSong = async (req, res) => {
	const result = queueService.getCurrentlyPlaying();
	res.status(200).json(result);
}

/**
 * Updates the queue with the currently connected spotify queue
 * 
 * @param {Object[]} queue - Array of song objects 
 * @returns {Promise<void>} - A promise that resolves with the JSON response for success and/or errors that occured
 */
const importQueueFromSpotify = (queue) => {
	let sptQueue = []
	// Create list of song items
	queue.forEach((item) => {
		sptQueue.push(Song.createFromSpotifyQueue(item));
	})
	const result = queueService.importQueueFromSpotify(sptQueue)
	const currQueue = queueService.getQueue()
	// res.status(200).json(result);
}

module.exports = {
	addSong,
	removeSong,
	getQueue,
	getNext,
	getCurrSong,
	importQueueFromSpotify
}