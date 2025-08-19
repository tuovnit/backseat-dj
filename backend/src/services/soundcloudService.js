const { Console } = require('console');
const querystring = require('querystring');
require('dotenv').config();
const Soundcloud = require("soundcloud.ts")
const roomController = require('../controllers/roomController');
/*
var roomSettings = {
	filteredGenres: [],
	explicit: false,
	durationFilter: 0,
	anyRoomCode: false,
	songVoting: true,
	streamingService: null
}
*/
class SoundCloudService{
    constructor() {
        this.soundcloud = new Soundcloud.default()
    }


/**
 * Performs a search for songs on Spotify based on the provided query.
 * @param {string} query - The search query.
 * @returns {Promise<Object>} - A promise that resolves to an object containing the search results.
 * @throws {Error} - If there is an error during the search process.
 */
    songSearch = async (query, roomId) => {
	
	const searchResults = {
		tracks: [],
	  };
	const roomSettings = await this.getRoomSettings(roomId)
	console.log("soundcloud settings: ",roomSettings)
	console.log("soundcloud room: ",roomId)
	// Use the fetch API to make the request
	try {
		const response = await this.soundcloud.tracks.searchV2({q: query});		//Warning, rn spotify+ tracks are included which are just previews
		const tracks =  response.collection;
		const genreSet = new Set(roomSettings.filteredGenres);
		tracks.map(async (track) => {
			console.log(track)
		  const name = track.title;
		  const artist = track.user.username
		  const album = "no album"
		  const albumImg = track.artwork_url;
		  const trackID = track.permalink_url //might use track.id?
		  const explicit = track.publisher_metadata ? track.publisher_metadata.explicit : false
		  const previewURL = track.preview_url;
		  const duration_ms = track.duration; //might use full_duration?
          const genre = track.genre
		  const tier = track.monetization_model
		  //console.log(explicit)
		  if(!genreSet.has(genre) && (roomSettings.explicit==true || explicit==false) && (duration_ms<roomSettings.durationFilter || roomSettings.duration_ms!=0)
		  && tier!='SUB_HIGH_TIER')
		   searchResults.tracks.push({ // places tracks in an array of 'objects'
			name,
			artist,
			album,
			albumImg,
			explicit,
			previewURL,
			trackID,
			duration_ms,
            genre
			
		  });
		});
		//console.log(searchResults.tracks)
		return searchResults; // Return the searchResults object directly
	  } catch (error) {
		console.error('Error:', error);
		throw error;
	  }

}
	getLyrics = async (url, duration) => {
		const response = await fetch(url);
			
				//console.log(response)
				const data = await response.json();
				//console.log(data)
				//console.log(data)
				if (response.status == 200){
					for( let i = 0; i<data.length; i++){
						//console.log(data[i])
						if((data[i].duration+2>=duration) && (data[i].duration-2<=duration)){
							return data[i].syncedLyrics
						//	break
						}
					};	
					//console.log(trackData.lyrics)
				}
				return ''
	}
	getTrackURL = async (songid, trackName, duration, artist_name) => {
		const trackData = {
			streamLink: '',
			lyrics: {}
		  };
		console.log("Track ID: ", songid)
		try {
			trackData.streamLink = await this.soundcloud.util.streamLink(songid);	
			//console.log("Calling get lyrics")
			const sanitizedQuery = trackName.replace(/ /g, '+')
			const sanitizedDur = (duration/1000).toString()
			//console.log(trackName)
			//console.log(sanitizedQuery)
			//console.log(sanitizedDur)
			//duration = 237
			const url = `https://lrclib.net/api/search?track_name=${sanitizedQuery}`;
			let lyrics = await this.getLyrics(url, sanitizedDur)
			if(lyrics==''){
			//	console.log("here")
				const url = `https://lrclib.net/api/search?track_name=${sanitizedQuery}&artist_name=${artist_name}`;
				lyrics = await this.getLyrics(url, sanitizedDur)
			}
			//console.log(lyrics)
			trackData.lyrics = lyrics
			return trackData // Return the searchResults object directly
		  } catch (error) {
			console.error('Error:', error);
			throw error;
		  }

	}
	/**
	 * Sets the room settings of a spotify controlled room.
	 * @param {string} settings - The room settings
	 * @returns {Promise<Object>} - A promise that resolves to an object containing the room settings.
	 */
	/*
    setRoomSettings = async (settings) => {
		console.log(settings)
	try{
		roomSettings = settings
		
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
*/
	/**
	 * Gets the room settings of a soundcloud controlled room.
	 * @param {string} settings - The room settings
	 * @returns {Promise<Object>} - A promise that resolves to an object containing the room settings.
	 */
    getRoomSettings = async (room_id) => {
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
    getGenre = async () => {

	//console.log("Calling getGenre")
	const genreResults = [
		//label: '', value: ''
	  ];
	const genreList = ['Alternative Rock',
	'Ambient',
	'Audiobooks',
	'Business',
	'Classical',
	'Comedy',
	'Country',
	'Dance',
	'EDM',
	'Dancehall',
	'Deep House',
	'Disco',
	'Drum & Bass',
	'Dubstep',
	'Electronic',
	'Entertainment',
	'Folk',
	'Singer-Songwriter',
	'Hip Hop',
	'Rap',
	'House',
	'Indie',
	'Jazz',
	'Blues',
	'Latin',
	'Learning',
	'Metal',
	'News & Politics',
	'Piano',
	'Pop',
	'R&B',
	'Soul',
	'Reggae',
	'Reggaeton',
	'Religion & Spirituality',
	'Rock',
	'Science',
	'Soundtrack',
	'Sports',
	'Storytelling',
	'Techno',
	'Technology',
	'Trance',
	'Trap',
	'Trending Audio',
	'Trending Music',
	'Trip Hop',
	'World'];
	genreList.forEach((genre) => {
		//console.log(genre)
		const label = genre
		const value = genre
		if (label != ''){
		genreResults.push( // places tracks in an array of 'objects'
			{label: label, value: value}
			
		);
		}
		});
	return genreResults
		
	 

}
	/*
	playSong = async (trackID) => {
		try {
			playbackObject.playAsync()
			return "now playing" // Return the searchResults object directly
		  } catch (error) {
			console.error('Error:', error);
			throw error;
		  }
	}
	pauseSong = async () => {
		try {
			playbackObject.pauseAsync()
			return "now pausing" // Return the searchResults object directly
		  } catch (error) {
			console.error('Error:', error);
			throw error;
		  }
	}
	*/
}
const soundcloudService = new SoundCloudService()
module.exports = soundcloudService