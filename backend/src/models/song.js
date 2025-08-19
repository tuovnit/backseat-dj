const { Sequelize, DataTypes } = require('sequelize')
const sequelize = require('../utils/dbConnect');

const Songs = sequelize.sequelize.define('songs', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
		autoIncrement: true,
    },
	roomid: {
		type: DataTypes.INTEGER,
        allowNull: false,
        foreignKey: true,
        references: {
            model: 'rooms',
            key: 'roomid'
        }
	},
    song_title: {
        type: DataTypes.STRING(100) 
    },
    song_artist: {
        type: DataTypes.STRING(100) 
    },
    song_album: {
        type: DataTypes.STRING(100) 
    },
    songid: {
        type: DataTypes.STRING(200) 
    },
    song_img: {
        type: DataTypes.STRING(200) 
    },
    explicit: {
        type: DataTypes.TINYINT,
		defaultValue: 0,
    },
    number_plays: {
        type: DataTypes.INTEGER,
		defaultValue: 0,
    },
    vote_count: {
        type: DataTypes.INTEGER,
		defaultValue: 0,
    },
	added_by: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	duration: {
		type: DataTypes.BIGINT,
		allowNull: true
	},
	genre: {
		type: DataTypes.STRING(100),
		allowNull: true
	},
	played: {
		type: DataTypes.TINYINT,
		defaultValue: 0,
	},
	playing: {
		type: DataTypes.TINYINT,
		defaultValue: 0,
	},
	previewURL: {
		type: DataTypes.STRING,
		allowNull: true,
		defaultValue: null
	}
}, {
    tableName: 'songs',
    createdAt: true,
    updatedAt: false
});

/**
 * Represents a Song object.
 */
class Song {
	/**
	 * Creates a new Song instance.
	 * @param {string} songID - The ID of the song.
	 * @param {string} songTitle - The title of the song.
	 * @param {string} songArtist - The artist of the song.
	 * @param {string} albumTitle - The title of the album the song belongs to.
	 * @param {string} albumImg - The URL of the album cover image.
	 * @param {boolean} explicit - Indicates if the song contains explicit content.
	 * @param {string} previewURL - The URL of the song's preview.
	 */
	constructor(songID, songTitle, songArtist, albumTitle, albumImg, explicit, previewURL, duration_ms) {
		this.songID = songID;
		this.songTitle = songTitle;
		this.songArtist = songArtist;
		this.albumTitle = albumTitle;
		this.albumImg = albumImg;
		this.explicit = explicit;
		this.voteCount = 0;
		this.previewURL = previewURL;
		this.duration_ms = duration_ms
	}

	/**
	 * Creates a new Song instance based on the provided query object.
	 * @param {object} query - The query object containing song details.
	 * @returns {Song} - The newly created Song instance.
	 */
	static createFromRequestQuery(query) {
		return new Song(
			query.songID,
			query.songTitle,
			query.songArtist,
			query.albumTitle,
			query.albumImg,
			query.explicit === 'true',
			query.previewURL,
			query.duration_ms
		);
	}

	static createFromSpotifyQueue(songObj) {
		return new Song(
			songObj.trackID,
			songObj.name,
			songObj.artist,
			songObj.album,
			songObj.albumImg,
			songObj.explicit === 'true',
			songObj.previewURL,
			songObj.duration_ms
		)
	}

}
  
module.exports = {
    Song,
	Songs
}