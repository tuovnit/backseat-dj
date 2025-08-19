const Sequelize = require('sequelize');
const { User } = require('../models/user');
const { Songs } = require('../models/song');
const { Queue } = require('../models/queue');
const { Setting } = require('../models/setting');
const { SpotifyAccount } = require('../models/spotifyAccounts');
const { Vote } = require('../models/vote');
const { sequelize } = require('../utils/dbConnect');
const { Member } = require('../models/member');
const { Room } = require('../models/room');

/**
 * Creates a Spotify account and links it to a user.
 * 
 * @param {string} user_id - The ID of the user.
 * @param {string} token - The access token for the Spotify account.
 * @param {string} refresh_token - The refresh token for the Spotify account.
 * @returns {Object} - The result of the operation.
 * @returns {number} status - The status code of the operation.
 * @returns {string} message - The message indicating the result of the operation.
 * @returns {Object} error - The error object, if an error occurred.
 */
const createSpotifyAccount = async (user_id, token, refresh_token) => {
	SpotifyAccount.create(
		{
			userid: user_id,
			access_token: token,
			refresh_token: refresh_token,
		}).then((query) => {
			if (query){
				return {
					status: 200,
					message: "Spotify account successfully created and linked to user",
					error: null,
				}
			}
		}).catch(error => {
			console.error(error);
			return {
				status: 500,
				message: "An error occured while saving your Spotify account",
				error: error,
			}
		})
}

/**
 * Retrieves a Spotify account based on the provided user ID.
 * @param {string} user_id - The user ID to search for.
 * @returns {Promise<Object>} - A promise that resolves to an object containing the Spotify account details.
 */
const getSpotifyAccount = async (user_id) => {
	return SpotifyAccount.findOne({
			where: {
				userid: user_id,
			}
		}).then((query) => {
			if (query) {
				console.log(query.dataValues);
				return {
					status: 200,
					message: "Successfully acquired Spotify account",
					error: null,
					userid: query.dataValues.userid,
					access_token: query.dataValues.access_token,
					refresh_token: query.dataValues.refresh_token,
					createdAt: query.dataValues.createdAt,
					updatedAt: query.dataValues.updatedAt,
				}
			}else {
				return {
					status: 500,
					message: "User id not found",
					error: `No Spotify Account Found`
				}
			}
		}).catch(error => {
			console.error(error);
			return {
				status: 500,
				message: "Error occured while fetching Spotify account",
				error: error,
			}
		});
}

/**
 * Retrieves a Spotify token by ID and user ID.
 * @param {string} id - The ID of the Spotify account.
 * @param {string} userID - The ID of the user.
 * @returns {Promise<Object>} - A promise that resolves to an object containing the Spotify token information.
 */
const getSpotifyTokenByID = async (id) => {
	return SpotifyAccount.findOne({
		where: {
			id: id
		}
	}).then((query) => {
		if (query) {
			const updatedAt = new Date(query.dataValues.updatedAt)
			const now = new Date();
			const timeDiff = (now - updatedAt) / (1000 * 60 * 60);
			if (timeDiff < 3600000){
				return {
					status: 200,
					message: "Successfully acquired Spotify token",
					error: null,
					id: query.dataValues.id,
					access_token: query.dataValues.access_token,
					refresh_token: query.dataValues.refresh_token,
				}
			}else {
				// spotifyService.refreshToken(id, userID).then(() => {
				// 	getSpotifyTokenByID(id);
				// })
			}

		}else {
			return {
				status: 500,
				message: "id not found",
				error: `No Spotify Account Found`
			}
		}
	}).catch(error => {
		console.error(error);
		return {
			status: 500,
			message: "Error occured while fetching Spotify token",
			error: error,
		}
	})
}

/**
 * Retrieves the Spotify refresh token by ID.
 * @param {number} id - The ID of the Spotify account.
 * @returns {Promise<Object>} - A promise that resolves to an object containing the status and refresh token.
 * @throws {Error} - If an error occurs while fetching the Spotify token.
 */
const getSpotifyRefreshTokenByID = async (id) => {
	return await SpotifyAccount.findOne({
		where: {
			id: id
		}
	}).then((query) => {
		if (query) {
			return {
				status: 200,
				refresh_token: query.dataValues.refresh_token
			}
		}else {
			return {
				status: 500,
				message: "id not found",
				error: `No Spotify Account Found`
			}
		}
	}).catch(error => {
		console.error(error);
		return {
			status: 500,
			message: "Error occured while fetching Spotify token",
			error: error,
		}
	})
}

/**
 * Updates the Spotify account information for a user.
 * @param {string} user_id - The ID of the user.
 * @param {string} token - The access token for the Spotify account.
 * @param {string} refresh_token - The refresh token for the Spotify account.
 * @returns {Object} - The result of the update operation.
 * @returns {number} status - The status code of the operation.
 * @returns {string} message - The message indicating the result of the operation.
 * @returns {string|null} error - The error message, if any.
 * @returns {string|null} access_token - The updated access token.
 * @returns {string|null} refresh_token - The updated refresh token.
 */
const updateSpotifyAccount = async (user_id, token, refresh_token) => {
	return SpotifyAccount.findOne({
		where: {
			userid: user_id
		}
	}).then(query => {
		if(query){
			return query.update({
				access_token: token,
				refresh_token: refresh_token
			}).then((result) => {
				if (result){
					return {
						status: 200,
						message: "Spotify account info successfully updated",
						error: null,
						access_token: result.dataValues.access_token,
						refresh_token: result.dataValues.refresh_token,
					}
				}else {
					return {
						status: 500,
						message: "An error occured while updating the Spotify account",
						error: "Update failed"
					}
				}
			}).catch(error => {
				console.error(error);
				return {
					status: 500,
					message: "An error occured while updating the Spotify account",
					error: error,
				}
			})
		} else {
			return createSpotifyAccount(user_id, token, refresh_token);
		}
	})
}

/**
 * Creates a queue for a given room.
 * 
 * @param {string} room_id - The ID of the room.
 * @returns {Object} - The result of the queue creation.
 * @property {number} status - The status code of the result.
 * @property {string} message - The message describing the result.
 * @property {Error|null} error - The error object, if any.
 */
const createQueue = async (room_id) => {
	Queue.create({
		roomid: room_id,
		number_plays: 0,
	}).then((query) => {
		if (query) {
			return {
				status: 200,
				message: "Queue successfully created",
				error: null,
			}
		}
	}).catch(error => {
		console.error(error);
		return {
			status: 500,
			message: "Error occured while creating queue",
			error: error,
		}
	});
}

/**
 * Retrieves the queue of songs for a given room ID.
 * @param {number} room_id - The ID of the room.
 * @returns {Promise<Object>} - A promise that resolves to an object containing the status, message, error, and queue.
 */
const getQueue = async (room_id) => {
	const queue = [];

	try {
		const songs = await Songs.findAll({
			where: {
				roomid: room_id,
				played: 0,
				playing: 0
			},
			order: [
				['vote_count', 'DESC'],
				// ['createdAt', 'ASC'],
			]
		})
		console.log("Songs found in queue: ", songs)
		console.log("Songs found in queue length: ", songs.length)
		if(songs != undefined && songs.length > 0){
			songs.forEach(song => {queue.push(song.dataValues)})
			return {
				status: 200, 
				message: "Successfully acquired queue", 
				error: null, 
				queue: queue
			}
		}else{
			return {
				status: 200, 
				message: "Queue is empty", 
				error: null, 
				queue: []
			}
		}
	} catch (error) {
		console.log(error)
		return {
			status: 500, 
			message: "Something went wrong trying to get the queue", 
			error: error, 
			queue: []
		}
	}

}

/**
 * Adds a song to the queue.
 * 
 * @param {string} room_id - The ID of the room.
 * @param {string} song_title - The title of the song.
 * @param {string} song_artist - The artist of the song.
 * @param {string} song_album - The album of the song.
 * @param {string} song_id - The ID of the song.
 * @param {string} song_img - The image URL of the song.
 * @param {boolean} explicit - Indicates if the song is explicit.
 * @param {number} vote_count - The vote count of the song.
 * @param {string} added_by - The user who added the song.
 * @param {number} duration - The duration of the song in seconds.
 * @param {string} genre - The genre of the song.
 * @returns {Object} - The result of adding the song to the queue.
 *                    - If successful, returns { status: 200, message: "Song successfully added to queue", error: null }.
 *                    - If an error occurs, returns { status: 500, message: "Error occurred while adding song to queue", error: Error }.
 */
async function addSongToQueue (room_id, song_title, song_artist, song_album, song_id, song_img, explicit, vote_count, added_by, duration, genre, preview_url) {
	try {
		await Songs.create({
			roomid: room_id,
			song_title: song_title,
			song_artist: song_artist,
			song_album: song_album,
			songid: song_id,
			song_img: song_img,
			explicit: explicit,
			vote_count: vote_count,
			added_by: added_by,
			duration: duration,
			genre: genre,
			previewURL: preview_url,
		})
		return {status: 200, message: "Song successfully added to queue", error: null}

	} catch (error) {
		console.log(error)
		return {status: 500, message: "Error occured while adding song to queue", error: error}
	}
	
}

/**
 * Removes a song from the queue.
 * 
 * @param {number} room_id - The ID of the room.
 * @param {number} song_id - The ID of the song to be removed.
 * @returns {Promise<Object>} A promise that resolves to an object containing the status, message, and error (if any).
 */
const removeSongFromQueue = async (song_id) => {
	return Songs.destroy({
		where: {
			id: song_id,
		}
	}).then((query) => {
		if (query) {
			return {
				status: 200,
				message: "Song successfully removed from queue",
				error: null,
			}
		}else {
			return {
				status: 500,
				message: "Song not removed",
				error: "Removal error",
			}
		}
	}).catch(error => {
		console.error(error);
		return {
			status: 500,
			message: "Song not found",
			error: error,
		}
	})
}


/**
 * Retrieves the currently playing song for a given room.
 * 
 * @param {number} room_id - The ID of the room.
 * @returns {Promise<Object>} - A promise that resolves to an object containing the status, message, error, and song details.
*/
const getCurrentlyPlaying = async (room_id) => {
	return Songs.findOne({
		where: {
			roomid: room_id,
			playing: 1,
		}
	}).then((query) => {
		if (query) {
			return {
				status: 200,
				message: 'Successfully acquired currently playing song',
				error: null,
				song: query.dataValues,
			}
		}else {
			return getNextSong(room_id);
		}
	}).catch(err => {
		console.error(err);
		return {
			status: 500,
			message: 'Error occured while fetching current song',
			error: err,
			song: null,
		}
	})
}

/**
 * Skips the currently playing song in a room and returns the next song.
 * @param {string} room_id - The ID of the room.
 * @returns {Promise<Object>} - A promise that resolves to the next song object.
*/
const skipSong = async (room_id) => {
	const currentlyPlaying = await getCurrentlyPlaying(room_id)
	if (currentlyPlaying.status == 200){
		await setSongPlayed(room_id, currentlyPlaying.song.id);	
	}
	return await getNextSong(room_id);
}

/**
 * Updates the status of a song to indicate that it has been played in a specific room.
 * @param {number} room_id - The ID of the room.
 * @param {number} song_id - The ID of the song.
 * @returns {Promise<Object>} - A promise that resolves to an object containing the status, message, and error (if any).
*/
const setSongPlayed = async (room_id, song_id) => {
	Songs.update({
		playing: 0,
		played: 1,
	}, {
		where: {
			id: song_id,
			roomid: room_id,
			playing: 1
		}
	}).then((query) => {
		if (query) {
			return {
				status: 200,
				message: "Current song successfully updated",
				error: null,
			}
		}
	}).catch(error => {
		console.error(error);
		return {
			status: 500,
			message: "Error occured while updating current song",
			error: error,
		}
	})
}

/**
 * Updates the playing status of a song in the database.
 * @param {number} song_id - The ID of the song to update.
 * @returns {Promise<Object>} - A promise that resolves to an object containing the status, message, and error (if any).
*/
const setSongPlaying = async (song_id) => {
	Songs.update({
		playing: 1,
	}, {
		where: {
			id: song_id
		}
	}).then((query) => {
		if (query) {
			return {
				status: 200,
				message: "Current song successfully updated",
				error: null,
			}
		}
	}).catch(error => {
		console.error(error);
		return {
			status: 500,
			message: "Error occured while updating current song",
			error: error,
		}
	})
}

/**
 * Retrieves the next song from the database for a given room.
 * 
 * @param {number} room_id - The ID of the room.
 * @returns {Promise<Object>} - A promise that resolves to an object containing the status, message, error, and song details.
*/
const getNextSong = async (room_id) => {
	return Songs.findAll({
		where: {
			roomid: room_id,
			playing: 0,
			played: 0,
		},
		order: [
			['vote_count', 'DESC'],
			// ['createdAt', 'ASC'],
		]
	}).then((query) => {
		if (query.length > 0) {
			console.log(query)
			console.log(query[0].dataValues)
			setSongPlaying(query[0].dataValues.id);
			return {
				status: 200,
				message: 'Successfully acquired currently playing song',
				error: null,
				song: query[0].dataValues,
			}
		}else {
			return {
				status: 500,
				message: 'No song found in queue',
				error: 'No more songs in queue',
				song: null,
			}
		}
	}).catch(err => {
		console.error(err);
		return {
			status: 500,
			message: 'Error occured while fetching next song',
			error: err,
			song: null,
		}
	})
}

/**
 * Retrieves the username associated with the given user ID.
 * @param {number} user_id - The ID of the user.
 * @returns {Promise<string>} - A promise that resolves to the username.
*/
const getMyUsername = async (user_id) => {
	return User.findOne({
		where: {
			id: user_id
		}
	}).then(query => {
		if (query) {
			return query.dataValues.name;
		}
	}).catch(err => console.error(err));
}

/**
 * Updates the vote count of a song in the database.
 * 
 * @param {number} room_id - The ID of the room.
 * @param {number} song_id - The ID of the song.
 * @param {number} vote_count - The new vote count for the song.
 * @returns {Promise<Object>} - A promise that resolves to an object containing the status, message, and error (if any).
 */
const updateSongVoteCount = async (song_id, vote_change) => {
	return Songs.findOne({
		where: {
			id: song_id,
		}
	}).then((query) => {
		if (query) {
			if (query.vote_count == 1 && vote_change == -1){
				return query.update({
					vote_count: query.dataValues.vote_count - 2
				}).then((result) => {
					if (result) {
						return {
							status: 200,
							message: "Vote count successfully updated",
							error: null,
							count: result.dataValues.vote_count
						}
					}
				}).catch(error => {
					console.error(error);
					return {
						status: 500,
						message: "Error occured while updating vote count",
						error: error,
						count: 0
					}
				})
			}else if (query.vote_count == -1 && vote_change == 1){
				return query.update({
					vote_count: query.dataValues.vote_count + 2
				}).then((result) => {
					if (result) {
						return {
							status: 200,
							message: "Vote count successfully updated",
							error: null,
							count: result.dataValues.vote_count
						}
					}
				}).catch(error => {
					console.error(error);
					return {
						status: 500,
						message: "Error occured while updating vote count",
						error: error,
						count: 0
					}
				})
			}else {
				return query.update({
					vote_count: query.dataValues.vote_count + vote_change
				}).then((result) => {
					if (result) {
						return {
							status: 200,
							message: "Vote count successfully updated",
							error: null,
							count: result.dataValues.vote_count
						}
					}
				}).catch(error => {
					console.error(error);
					return {
						status: 500,
						message: "Error occured while updating vote count",
						error: error,
						count: 0
					}
				})
			}
		}
	}).catch(error => {
		console.error(error);
		return {
			status: 500,
			message: "Error occured while updating vote count",
			error: error,
			count: 0
		}
	})
}

/**
 * Casts a vote for a specific vote_id.
 * @param {number} vote_id - The ID of the vote.
 * @param {boolean} up - Indicates whether the vote is an upvote.
 * @param {boolean} down - Indicates whether the vote is a downvote.
 * @returns {Promise<{status: number, change: number}>} - A promise that resolves to an object containing the status code and the vote change.
 */
const castVote = async (vote_id, up, down) => {
	return Vote.findOne({
		where: {
			id: vote_id
		}
	}).then(async (query) => {
		if (query){
			if (query.dataValues.novote){ // no vote when first vote is cast then always up or down
				if (up) {
					await updateVote(vote_id, up, down);
					return {
						status: 200,
						change: 1,
					}
				}else {
					await updateVote(vote_id, up, down);
					return {
						status: 200,
						change: -1,
					}
				}
			}else if (query.dataValues.upvote){
				if (down){
					await updateVote(vote_id, up, down);
					return {
						status: 200,
						change: -1,
					}
				}else {
					return {
						status: 500,
						change: 0,
					}
				}
			}else {
				if (up){
					await updateVote(vote_id, up, down);
					return {
						status: 200,
						change: 1,
					}
				}else {
					return {
						status: 500,
						change: 0,
					}
				}
			}
		}
	})
}

async function createGuestUser(guestName) {
	const user = await User.create({
		email: guestName + "@partynanimal.com",
		password: null,
		name: guestName,
		guest: true
	})

	return user.dataValues
}

const getRoomSettings = (room_id) => {
	
}

/**
 * Updates a vote in the database.
 * @param {number} vote_id - The ID of the vote to update.
 * @param {boolean} up - The new upvote value.
 * @param {boolean} down - The new downvote value.
 * @returns {Promise<Object>} - A promise that resolves to an object containing the status, message, and error (if any) of the update operation.
 */
const updateVote = async (vote_id, up, down) => {
	return Vote.update({
		upvote: up,
		downvote: down,
		novote: false
	}, {
		where: {
			id: vote_id
		}
	}).then((query) => {
		if (query) {
			return {
				status: 200,
				message: "Vote successfully updated",
				error: null,
			}
		}
	}).catch(error => {
		console.error(error);
		return {
			status: 500,
			message: "Error occured while updating vote",
			error: error,
		}
	})
}

/**
 * Checks if a vote exists in the database for a given room, song, and user.
 * If the vote exists, it returns the vote details.
 * If the vote does not exist, it creates a new vote and returns the newly created vote details.
 * @param {number} room_id - The ID of the room.
 * @param {number} song_id - The ID of the song.
 * @param {number} user_id - The ID of the user.
 * @returns {Promise<Object>} - A promise that resolves to an object containing the vote details.
 */
const checkVoteExists = async (room_id, song_id, user_id) => {
	return Vote.findOne({
		where: {
			room_id: room_id,
			song_id: song_id,
			user_id: user_id
		}
	}).then((query) => {
		if (query) {
			return {
				status: 200,
				message: "Vote successfully acquired",
				error: null,
				vote: query.dataValues.id
			}
		}else {
			console.log("vote doesnt exist - Creating new vote")
			return createVote(room_id, song_id, user_id);
		}
	}).catch(error => {
		console.error(error);
		return {
			status: 500,
			message: "Error occured while creating vote",
			error: error,
			vote: null
		}
	})
}

/**
 * Creates a vote in the database.
 * 
 * @param {number} room_id - The ID of the room.
 * @param {number} song_id - The ID of the song.
 * @param {number} user_id - The ID of the user.
 * @returns {Promise<Object>} A promise that resolves to an object containing the status, message, error, and vote ID.
 */
const createVote = async (room_id, song_id, user_id) => {
	return Vote.create({
		room_id: room_id,
		song_id: song_id,
		user_id: user_id,
		upvote: false,
		downvote: false,
		novote: true
	}).then((query) => {
		if (query) {
			return {
				status: 200,
				message: "Vote successfully created",
				error: null,
				vote: query.dataValues.id
			}
		}
	}).catch(error => {
		console.error(error);
		return {
			status: 500,
			message: "Error occured while creating vote",
			error: error,
			vote: null
		}
	})
}

/**
 * Retrieves the rooms associated with a given user ID.
 * @param {number} userID - The ID of the user.
 * @returns {Promise<{status: number, rooms: Array}>} - A promise that resolves to an object containing the status code and an array of rooms.
 */
const getUserRooms = async (userID) => {
	return await Member.findAll({
		where: {
			userid: userID
		}
	}).then(async (rooms) => {
		if (rooms) {
			var roomList = await Promise.all(rooms.map(async (roomMember) => {
                console.log(roomMember.roomid)
                const room = await getRoomByID(roomMember.roomid);
                const host = await getRoomHostName(roomMember.roomid);
                return Object.assign(room, host);
            }));
			return {
				status: 200,
				rooms: roomList
			}
		}else {
			// no rooms for given user
			return {
				status: 200,
				rooms: []
			}
		}
	}).catch(err => console.error(err));
}

/**
 * Retrieves a room by its ID.
 * @param {number} roomID - The ID of the room to retrieve.
 * @returns {Promise<Object>} A promise that resolves to the room object if found, or undefined if not found.
 */
const getRoomByID = async (roomID) => {
	return await Room.findByPk(roomID).then((query) => {
		if (query) {
			console.log(query)
			return query.dataValues
		}
	})
}

/**
 * Retrieves the host name of a room based on the room ID.
 * @param {number} roomID - The ID of the room.
 * @returns {Promise<{host_name: string}>} - A promise that resolves to an object containing the host name.
 */
const getRoomHostName = async (roomID) => {
	return await Room.findByPk(roomID).then((query) => {
		if (query) {
			return User.findByPk(query.dataValues.host)
			.then((result) => {
				if (result) {
					return {
						host_name: result.dataValues.name
					}
				}
			})
		}
	})
}

/**
 * Generates a summary of a room based on the songs that have been played.
 * @param {number} roomID - The ID of the room.
 * @returns {Promise<Object>} - A promise that resolves to an object containing the summary information.
 */
const generateRoomSummary = async (roomID) => {
	// Fetch all songs in room that have been played
	return await Songs.findAndCountAll({
		where: {
			roomid: roomID,
			played: 1
		}
	}).then(async (songQuery) => {
		if (songQuery) {
			console.log(songQuery)
			const counts = {
				song_count: songQuery.count,
				user_count: await getNumPartyAnimals(roomID)
			}
			return {
				status: 200,
				summary: Object.assign(counts, getMostPopularData(songQuery.rows))
			}
		}else {
			console.log('No songs in room')
			return {
				status: 200,
				song_count: 0,
				summary: {}
			}
		}
	}).catch(err => console.error(err));
}

/**
 * Retrieves the most popular data from a given song list.
 * 
 * @param {Array} songList - The list of songs to analyze.
 * @returns {Object} - An object containing the most popular song, genre, and DJ.
 */
const getMostPopularData = (songList) => {

	if (songList.length == 0){
		return {
			song: null,
			genre: null,
			DJ: null
		}
	}else {
		let highestVoteCountSong = songList[0];
		let genreCounts = {};
		let addedByCounts = {};
		let mostFrequentGenre = songList[0].genre;
		let mostFrequentAddedBy = songList[0].added_by;

		songList.forEach((song) => {
			// Check for highest vote_count
			if (song.vote_count > highestVoteCountSong.vote_count) {
				highestVoteCountSong = song;
			}
	
			// Count genre occurrences
			if (song.genre) {
				genreCounts[song.genre] = (genreCounts[song.genre] || 0) + 1;
				if (genreCounts[song.genre] > genreCounts[mostFrequentGenre]) {
					mostFrequentGenre = song.genre;
				}
			}
	
			// Count added_by occurrences (most popular DJ)
			addedByCounts[song.added_by] = (addedByCounts[song.added_by] || 0) + 1;
			if (addedByCounts[song.added_by] > addedByCounts[mostFrequentAddedBy]) {
				mostFrequentAddedBy = song.added_by;
			}
		});
		return {
			song: highestVoteCountSong,
			genre: mostFrequentGenre,
			DJ: mostFrequentAddedBy,
		};
	}

}

/**
 * Retrieves the number of party animals in a room.
 * @param {string} roomID - The ID of the room.
 * @returns {Promise<number>} - The number of party animals in the room.
 */
const getNumPartyAnimals = async (roomID) => {
	return await Member.findAndCountAll({
		where: {
			roomid: roomID
		}
	}).then((query) => {
		if (query) {
			return query.count;
		}
	}).catch(err => console.error(err))
}

module.exports = {
	createSpotifyAccount,
	getSpotifyAccount,
	updateSpotifyAccount,
	getSpotifyTokenByID,
	getSpotifyRefreshTokenByID,
	createQueue,
	getQueue,
	addSongToQueue,
	removeSongFromQueue,
	updateSongVoteCount,
	checkVoteExists,
	getCurrentlyPlaying,
	setSongPlayed,
	setSongPlaying,
	getNextSong,
	skipSong,
	getMyUsername,
	castVote,
	createGuestUser,
	getUserRooms,
	generateRoomSummary
}