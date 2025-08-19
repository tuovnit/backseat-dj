const { Console } = require('console');
const querystring = require('querystring');
const QueueController = require('../controllers/queueController');
const roomController = require('../controllers/roomController');
const dbController = require('../controllers/dbController');
require('dotenv').config();

// spotify stuff
const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const redirectUri = process.env.SPOTIFY_REDIRECT_URL;
var spotifyAccessToken = null;
var playbackDevice = null;
var deviceList;


var currUser = null;

/**
 * Redirects the user to the Spotify login page and connects to our app (Spotify Developer App).
 *
 * @param {Object} res - The response object.
 * @param {string} scopes - The requested scopes for the user's authorization.
 * @param {string} state - The state parameter to protect against cross-site request forgery attacks.
 * @returns {void}
 */
const authenticateUser = async (res, scopes, state, user_id) => {

	currUser = user_id;

	// Redirects to the spotify login page and connects to our app (spotify developer app)
	res.redirect('https://accounts.spotify.com/authorize?' +
	querystring.stringify({
		response_type: 'code',
		client_id: clientId,
		scope: scopes,
		redirect_uri: redirectUri,
		state: state
	}));
}

/**
 * Handles user authorization by fetching the access token using the authentication code.
 * If no state is provided, the request is considered invalid and an error is returned.
 * After fetching the access token, it redirects the user to the specified URL.
 *
 * @param {Object} res - The response object.
 * @param {string} code - The authentication code.
 * @param {string} state - The state parameter.
 * @returns {Promise<void>} - A promise that resolves when the authorization process is complete.
 */
const getUserAuthorization = async (res, code, state) => {
	// If no state is provided, the request is invalid
	if (state === null) {
		res.redirect('/#' +
		querystring.stringify({
			error: 'state_mismatch'
		}));
	} else {

		
		// Fetches the access token using the authentication code
		getAccessToken(code);
		res.redirect('Backseat-DJ://');
	}
}

const refreshToken = async (id, userID) => {
	// Refresh token with spotify
	const token = await dbController.getSpotifyRefreshTokenByID(id)
	const base64Credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
	const response = await fetch('https://accounts.spotify.com/api/token', {
		method: 'POST',
		headers: {
			'content-type': "application/x-www-form-urlencoded",
			'Authorization': 'Basic ' + base64Credentials
		},
		form: {
			'grant_type': 'refresh_token',
			'refresh_token': token
		},
		json: true,
	}).then((result) => result.json())
	.then(async (data) => {
		// update db
		return await dbController.updateSpotifyAccount(userID, data.access_token, data.refreshToken)
		.then((response) => {
			if (response.status == 200){
				return {
					status: 200,
					token: response.access_token
				}
			}
		} )
	})
}

/**
 * Retrieves the access token from Spotify API using the authorization code.
 * @param {string} code - The authorization code received from Spotify.
 * @param {string} userid - The ID of the user.
 * @returns {Promise<void>} - A promise that resolves when the access token is retrieved.
 */
const getAccessToken = async (code, userid) => {

	// Build the request body for the url
	const requestBody = new URLSearchParams();
	requestBody.append('grant_type', 'authorization_code');
	requestBody.append('code', code);
	requestBody.append('redirect_uri', redirectUri);
	// combine client id and client secret from spotify app 
	const base64Credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

	// combine the parts of the url and fetch the access token
	const response = await fetch('https://accounts.spotify.com/api/token', {
		method: 'POST',
		headers: {
			'content-type': "application/x-www-form-urlencoded",
			'Authorization': 'Basic ' + base64Credentials
		},
		body: requestBody,
	});

	const data = await response.json();
	spotifyAccessToken = data.access_token; //Sets global variable for the access token

	await dbController.updateSpotifyAccount(currUser, data.access_token, data.refresh_token)

	currUser = null;
}

/**
 * Retrieves the Spotify access token for a given user.
 * @param {string} userid - The ID of the user.
 * @returns {Object} - An object containing the Spotify access token.
 */
const getToken = (userid) => {

	// Fetch token from db

	return {
		'token': spotifyAccessToken
	}
}

/**
 * Retrieves the Spotify refresh token for a given user ID.
 * @param {string} userid - The ID of the user.
 * @returns {Object} - An object containing the Spotify refresh token.
 */
const getRefreshToken = (id) => {
	// Fetch spotify refresh token from db
	
	return {

	};
}


/**
 * Performs a search for songs on Spotify based on the provided query.
 * @param {string} query - The search query.
 * @param {string} roomId - The ID of the room.
 * @returns {Promise<Object>} - A promise that resolves to an object containing the search results.
 * @throws {Error} - If there is an error during the search process.
 */
const songSearch = async (query, roomId) => {

	// Replace spaces with '%20' in the query
	const sanitizedQuery = encodeURIComponent(query);

	// Spotify API base URL for search
	const baseURL = 'https://api.spotify.com/v1/search';

	// Construct the complete URL with the query and type parameters
	const url = `${baseURL}?q=${sanitizedQuery}&type=track%2Cartist`;
	const genreSet = new Set(roomSettings.filteredGenres);
	// Include the authorization header
	const headers = {
		Authorization: `Bearer ${spotifyAccessToken}`,
	};

	const searchResults = {
		tracks: [],
		artists: [],
	  };
	const roomSettings = await this.getRoomSettings(roomId)
	// Use the fetch API to make the request
	try {
		const response = await fetch(url, { headers });
		const data = await response.json();
		//console.log(data)
		const tracks = data.tracks.items;
		const artists = data.artists.items;
		const filteredOutArtists = []
		artists.forEach((artist) =>{
			
			const genres = artist.genres.map(genre => genre.replace(" ", '-'))
			
			genres.forEach((genre) =>{
				if(genreSet.has(genre)){
					filteredOutArtists.push(artist.name)
					console.log("Filterd artist: ", artist.name, " Genre: ", genre)
				}
			})
			
		});
		const artistSet = new Set(filteredOutArtists);
		tracks.forEach((track) => {
		  const name = track.name;
		  const artist = track.artists.map((artist) => artist.name).join(', ');
		  const album = track.album.name;
		  const albumImg = track.album.images.map((image) => image.url);
		  const trackID = track.id
		  const explicit = track.explicit;
		  const previewURL = track.preview_url;
		  const duration_ms = track.duration_ms;
		
		  if(!artistSet.has(artist) && (roomSettings.explicit==true || explicit==false) && (duration_ms<roomSettings.durationFilter || roomSettings.duration_ms!=0))
		  searchResults.tracks.push({ // places tracks in an array of 'objects'
			name,
			artist,
			album,
			albumImg: albumImg[0],
			trackID,
			explicit,
			previewURL,
			duration_ms
		  });
		});
		
		//console.log(searchResults.artists)
		return searchResults; // Return the searchResults object directly
	  } catch (error) {
		console.error('Error:', error);
		throw error;
	  }
}

const songSearchWithToken = async (query, token) => {

	console.log("Token:", token)
	
	// Replace spaces with '%20' in the query
	const sanitizedQuery = encodeURIComponent(query);

	// Spotify API base URL for search
	const baseURL = 'https://api.spotify.com/v1/search';

	// Construct the complete URL with the query and type parameters
	const url = `${baseURL}?q=${sanitizedQuery}&type=track%2Cartist`;

	// Include the authorization header
	const headers = {
		Authorization: `Bearer ${token}`,
	};

	const searchResults = {
		tracks: [],
		artists: [],
	  };

	// Use the fetch API to make the request
	try {
		const response = await fetch(url, { headers });
		const data = await response.json();
		console.log(data)
		const tracks = data.tracks.items;
		const artists = data.artists.items;
		tracks.forEach((track) => {
		  const name = track.name;
		  const artist = track.artists.map((artist) => artist.name).join(', ');
		  const album = track.album.name;
		  const albumImg = track.album.images.map((image) => image.url);
		  const trackID = track.id
		  const explicit = track.explicit;
		  const previewURL = track.preview_url;
		  const duration_ms = track.duration_ms;
	
		  searchResults.tracks.push({ // places tracks in an array of 'objects'
			name,
			artist,
			album,
			albumImg: albumImg[0],
			trackID,
			explicit,
			previewURL,
			duration_ms
		  });
		});
		artists.forEach((artist) =>{
			const artistName = artist.name;
			const genres = artist.genres;
			if (genres.length > 0){ //Filter out artists with no listed genres. This means that these artists will slip past any genre filter.
			searchResults.artists.push({ //places artists in an array of 'objects'
				artistName,
				genres
			});
			}
		});
		//console.log(searchResults.artists)
		return searchResults; // Return the searchResults object directly
	  } catch (error) {
		console.error('Error:', error);
		throw error;
	  }
}

function normalizeGenre(artist){
	artist.genres = artist.genres.map(genre => genre.replace(" ", '-'))
	return artist
}
const getGenre = async () => {
	// Spotify API URL for get genre
	console.log("Calling getGenre")
	const url = `https://api.spotify.com/v1/recommendations/available-genre-seeds`;

	// Include the authorization header
	const headers = {
		Authorization: `Bearer ${spotifyAccessToken}`,
	};

	const genreResults = [
		//label: '', value: ''
	  ];

	// Use the fetch API to make the request
	try {
		const response = await fetch(url, { headers });
		//console.log(response.headers)
		const data = await response.json({ });
		//console.log(data)
		if (data.error){genreResults.push({label: 'error', value: 'error'})}
		else{
			const genres = data.genres;
			//console.log(genres)
			genres.forEach((genre) => {
			//console.log(genre)
			const label = genre
			const value = genre
			if (label != ''){
			genreResults.push( // places tracks in an array of 'objects'
				{label: label, value: value}
				
			);
			}
			});
		}
		//console.log(data)
		//console.log(genreResults[1])
		return genreResults; // Return the searchResults object directly
		
	  } catch (error) {
		console.error('Error:', error);
		throw error;
	  }
}

/**
 * Gets the room settings of a spotify controlled room.
 * @param {string} settings - The room settings
 * @returns {Promise<Object>} - A promise that resolves to an object containing the room settings.
 */
const getRoomSettings = async (room_id) => {
	try{
		//console.log(roomSettings)
		return await roomController.getRoomSettings(room_id)
			
		
	}catch(error){
		//console.log(error)
		return {
			'error': error,
			'type':	'fail'
		};
	}
}

/**
 * Plays a song on Spotify.
 * @param {string} trackID - The ID of the track to be played.
 * @returns {Promise<Object>} - A promise that resolves to an object with the result of the playback.
 */
const playSong = async (trackID) => {

	// Start playback
	await fetch(`https://api.spotify.com/v1/me/player/play`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${spotifyAccessToken}`
				},
				body: JSON.stringify({
					uris: [`spotify:track:${trackID}`],
				}),
			})
			.then(result => {
				return({
					'type': 'success'
				});
			})
			.catch(error => {
				console.error(error)
				return({
					'type': 'fail',
					'status': error.status,
					'message': error.message
					
				});
			});
	return({
		"type": "fail",
		"status": "No Playback Device",
		"message": "There is no playback device connected"
	})
}

/**
 * Pauses the currently playing song on Spotify.
 * @returns {Promise<Object>} A promise that resolves to an object with the result of the pause operation.
 */
const pauseSong = async () => {

	// await getAvailableDevices();

	await fetch(`https://api.spotify.com/v1/me/player/pause`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${spotifyAccessToken}`
				}
			})
			.then(result => {
				return({
					'type': 'success'
				});
			})
			.catch(error => {
				console.error(error)
				return({
					'type': 'fail',
					'status': error.status,
					'message': error.message
					
				});
			});

}

/**
 * Retrieves the available devices for the current Spotify user.
 * @returns {Promise<void>} A promise that resolves with the available devices data.
 */
const getAvailableDevices = async () => {
	const url = 'https://api.spotify.com/v1/me/player/devices'

	return fetch(url, {
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${spotifyAccessToken}`
		}
	}).then(response => response.json())
	.then(data => {
		// Update device list
		return data;
	})
	.catch(err => console.error(err));
}


/**
 * Retrieves the playback device from the database.
 * @returns {Promise<Object>} A promise that resolves to the playback device object.
*/
const getPlaybackDevice = async () => {
	// retrieve playback device from db
	return playbackDevice;
}


/**
 * Sets the playback device for Spotify.
 * 
 * @param {string} deviceID - The ID of the device to set as the playback device.
 * @returns {Object} - An object containing the result of the operation.
 *                    - If successful, the object will have 'error' set to null and 'type' set to 'success'.
 *                    - If an error occurs, the object will have 'error' set to the error object and 'type' set to 'fail'.
*/
const setPlaybackDevice = (deviceID) => {
	try{
		playbackDevice = deviceID;
		console.log(`Playback device successfully updated (${playbackDevice})`)
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
 * Retrieves the user's playlists from Spotify API.
 * @returns {Promise<Object>} A promise that resolves to an object containing the user's playlists.
 */
const getUserPlaylists = async (userID) => {
	searchResults = {
		playlists: []
	}

	const token = await roomController.getSpotifyAccessToken(userID)

	const url = 'https://api.spotify.com/v1/me/playlists'
	
	return fetch(url, {
		headers: {
			'Authorization': `Bearer ${token}`
		}
	}).then(response => response.json())
	.then(data => {
		let playlists = data.items;

		playlists.forEach((item) => {
			const id = item.id;
			const uri = item.uri;
			const name = item.name;
			const image = item.images[0].url;
			searchResults.playlists.push(
				{
					id,
					uri,
					name,
					image
				}
			)
		})

		return searchResults;
	})
	.catch(err => console.error(err));
}

/**
 * Fetches the current spotify queue from the spotify api
 * @returns Queue to queue controller function or {Promise<{error: Error|null, type: string}>}
 */
const getUserQueue = async () => {
	const url = 'https://api.spotify.com/v1/me/player/queue'
	
	const searchResults = {
		tracks: [],
	  };

	return fetch(url, {
		headers: {
			'Authorization': `Bearer ${spotifyAccessToken}`
		}
	}).then(response => response.json())
	.then(data => {
		const tracks = data["queue"];
		if (tracks.length > 0) {
			tracks.forEach((track) => {
			  const name = track.name;
			  const artist = track.artists.map((artist) => artist.name).join(', ');
			  const album = track.album.name;
			  const albumImg = track.album.images.map((image) => image.url);
			  const trackID = track.id
			  const explicit = track.explicit;
			  const previewURL = track.preview_url;
			  const duration_ms = track.duration_ms;
		
			  searchResults.tracks.push({ // places tracks in an array of 'objects'
				name,
				artist,
				album,
				albumImg: albumImg[0],
				trackID,
				explicit,
				previewURL,
				duration_ms
			  });
			});
	
			QueueController.importQueueFromSpotify(searchResults["tracks"])
			return {
				'error': null,
				'type':	'success'
			}
		}else { //No songs in queue gives empty array not null or undefined
			return {
				'error': 'no songs in spotify queue',
				'type':	'fail'
			}
		}
	})
	.catch(err => console.error(err));
}

/**
 * Retrieves the playback state from the Spotify API.
 * @returns {Promise<Object>} A promise that resolves to an object containing the playback state.
 */
const getPlaybackState = async () => {
	const url = `https://api.spotify.com/v1/me/player`;

	return fetch(url, {
		headers: {
			'Authorization': `Bearer ${spotifyAccessToken}`
		}
	}).then(response => response.json())
	.then(data => {
		if (data){
			return {
				device_id: data["device"].id,
				active: data["device"].is_active,
				device_name: data["device"].name,
				device_type: data["device"].type,
				repeat_state: data.repeat_state,
				timestamp: data.timestamp,
				progress_ms: data.progress_ms,
				is_playing: data.is_playing,
				currently_playing_type: data.currently_playing_type,
				actions: data.actions,
				songTitle: data["item"].name,
				songArtist: data["item"].artists.map((artist) => artist.name).join(', '),
				explicit: data["item"].explict,
				songID: data["item"].id,
				albumImage: data["item"].album.images[0].url,
				songDuration: data["item"].duration_ms,
			}
		}else {

		}
	}).catch(error => console.error(error))
}

/**
 * Adds a track to the user's Spotify queue.
 * @param {string} track - The URI of the track to be added.
 * @returns {Promise<{error: string|null, type: string}>} - A promise that resolves to an object containing the error (if any) and the type of the response.
 */
const addTrackToQueue = async (track) => {
	const url = `https://api.spotify.com/v1/me/player/queue?uri=spotify%3Atrack%3A${track}`

	return fetch(url, {
		method: 'POST',
		headers: {
			'Authorization': `Bearer ${spotifyAccessToken}`
		}
	}).then(response => {
		if (response.status == 204){
			return {
				'error': null,
				'type':	'success'
			}
		}else {
			return {
				'error': `Response ${response.status}: ${response.statusText}`,
				'type':	'fail'
			}
		}
	})
	.catch(error => {
		console.error(error)
		return {
			'error': error,
			'type':	'fail'
		}
	})
}

/**
 * Retrieves the currently playing song information from the Spotify API.
 * @returns {Promise<Object>} A promise that resolves to an object containing the currently playing song information.
 */
const getCurrentlyPlaying = async () => {
	const url = `https://api.spotify.com/v1/me/player/currently-playing`;

	return fetch(url, {
		headers: {
			'Authorization': `Bearer ${spotifyAccessToken}`
		}
	}).then(response => response.json())
	.then(data => {
		if (data){
			return {
				device_id: data["device"].id,
				active: data["device"].is_active,
				device_name: data["device"].name,
				device_type: data["device"].type,
				repeat_state: data.repeat_state,
				timestamp: data.timestamp,
				progress_ms: data.progress_ms,
				is_playing: data.is_playing,
				song_name: data["item"].name,
				song_artist: data["item"].artists.map((artist) => artist.name).join(', '),
				song_explicit: data["item"].explict,
				song_id: data["item"].id,
				song_img: data["item"].album.images[0].url,
			}
		}else {

		}
	}).catch(error => console.error(error))
}

/**
 * Skips the current song in the Spotify player.
 * @returns {Promise<{error: string|null, type: string}>} A promise that resolves to an object with error and type properties.
 */
const skipSong = async () => {
	const url = `https://api.spotify.com/v1/me/player/next?device_id=${playbackDevice}`;
	
	return fetch(url, {
		method: 'POST',
		headers: {
			'Authorization': `Bearer ${spotifyAccessToken}`
		}
	}).then(response => {
		if (response.status == 204){
			return {
				'error': null,
				'type':	'success'
			}
		}else {
			return {
				'error': `Response ${response.status}: ${response.statusText}`,
				'type':	'fail'
			}
		}
	})
	.catch(error => {
		console.error(error)
		return {
			'error': error,
			'type':	'fail'
		}
	})
}

module.exports = {
	authenticateUser,
	getUserAuthorization,
	refreshToken,
	songSearch,
	songSearchWithToken,
	getGenre,
	getToken,
	getRoomSettings,
	playSong,
	pauseSong,
	getPlaybackDevice,
	setPlaybackDevice,
	getAvailableDevices,
	getUserPlaylists,
	getUserQueue,
	getPlaybackState,
	addTrackToQueue,
	getCurrentlyPlaying,
	skipSong
}