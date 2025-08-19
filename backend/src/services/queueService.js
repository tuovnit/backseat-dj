const queue = [];
var currentlyPlaying = null;


/**
 * Adds a song to the queue.
 * @param {Object} song - The song object to be added to the queue.
 * @returns {Object} - An object containing the result of the operation.
 *                    If successful, the 'error' property will be null and the 'type' property will be 'success'.
 *                    If there's an error, the 'error' property will contain the error object and the 'type' property will be 'fail'.
 */
const addSong = async (song) => {
	// NO Database so use array of song obj
					// Talk to database

					// Add to database
	try{
		queue.push(song);
		return {
			'error': null,
			'type':	'success'
		};
	}catch(error){
		return {
			'error': error,
			'type':	'fail'
		};
	}
}

/**
 * Removes a song from the queue based on its ID.
 * @param {string} songID - The ID of the song to be removed.
 * @returns {Promise<{error: Error|null, type: string}>} - A promise that resolves to an object with an error property (null if no error) and a type property indicating the result type ('success' or 'fail').
 */
const removeSong = async (songID) => {
	try{
		queue.splice(queue.findIndex(song => song.songID === songID), 1);
		return {
			'error': null,
			'type':	'success'
		};
	}catch(error){
		return {
			'error': error,
			'type':	'fail'
		};
	}
}

/**
 * Retrieves the current queue.
 * @returns {Array} The current queue.
 */
const getQueue = () => {
	if (queue.length == 0)
	{
		return null;
	}else {
		return queue;
	}
}

/**
 * Retrieves the next song from the queue.
 * @returns {Object} The currently playing song.
 */
const getNext = () => {
	// pops top song out of queue
	console.log(`before shift`)
	console.log(queue)
	currentlyPlaying = queue.shift()
	console.log(`after shift`)
	console.log(queue)
	if (currentlyPlaying == undefined){
		currentlyPlaying = null
	}
	return currentlyPlaying;
}

/**
 * Retrieves the currently playing item.
 *
 * @returns {any} The currently playing item.
 */
const getCurrentlyPlaying = () => {
	return currentlyPlaying;
}

/**
 * Imports the queue from current spotify session
 * 
 * @param {Object[]} songs - Array of song objects
 * @returns {Promise<{error: Error|null, type: string}>} - A promise that resolves to an object with an error property (null if no error) and a type property indicating the result type ('success' or 'fail').
 */
const importQueueFromSpotify = (songs) => {
	try{
		if (songs == null || songs == undefined){
			return {
				'error': 'no songs in spotify queue',
				'type':	'fail'
			};
		}else {
			songs.forEach(item => {
				addSong(item);
			});
			return {
				'error': null,
				'type':	'success'
			};
		}
	} catch(e){
		return {
			'error': e,
			'type':	'fail'
		};
	}
}

module.exports = {
	addSong,
	removeSong,
	getQueue,
	getNext,
	getCurrentlyPlaying,
	importQueueFromSpotify
}

