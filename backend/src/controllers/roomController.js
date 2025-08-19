const Sequelize = require('sequelize');
var express = require('express');
const User = require('../models/user');
const { Room } = require('../models/room');
const { Member } = require('../models/member');
const { SpotifyAccount } = require('../models/spotifyAccounts');
const dbController = require("./dbController");
const RoomController = require('../controllers/roomController');
const { Setting } = require('../models/setting');
const { sequelize } = require('../utils/dbConnect');
const { json } = require('body-parser');


const codeRegex = new RegExp("^[0-9]{6}")


/**
 *  
 * @returns The response back to the client is either the room id if a room is found with the room code provided, 
 * or it responds back to the client that no room matches this code 
 */
const checkRoomExistsByCode = (req, res) => {
    console.log("GET request to check if room exists")
    const clientRoomCode = req.body.roomCode;
	console.log(clientRoomCode);
    //check to see if room code is a 6 digit code
    if(!codeRegex.test(clientRoomCode)){
        return res.status(400).json({message: "Room Code must be 6 numerical values only"})
    }
    //check to see if room code field exists
    if(clientRoomCode){
        //query database for a room that exists with this room code.
        Room.findOne(
            {
                where: {
                    code: clientRoomCode
                }
            })
            .then(query => {
                //if this query returns a room, then send back to the client, the room id
                console.log("Query Result: ", query)
                if(query){
                    res.status(200).json(
						{status: 200}
					)
                }
                //otherwise, tell the client that no room matches with this code
                else{
                    return res.status(400).json({message: "No live rooms matching this code"})
                }
            })
            .catch(err => {
                console.log(err)
            })
    }
}


/**
 * 
 * @param {Number} userID 
 * @param {Number} roomCode 
 * @returns Creates a new room in the database and adds the hosts userID and the room code
 * associated with the room. Returns the room object
 */
async function createRoom(userID, roomCode, service) {

	if (service == "spotify"){
		return SpotifyAccount.findOne({
			where: {
				userid: userID
			}
		}).then(async (query) => {
			if (query){
					return await Room.create(
					{
						code: roomCode,
						host: userID,
						spotify_account: query.dataValues.id,
					})
			}
		})
	}else {
		return await Room.create(
			{
				code: roomCode,
				host: userID
			})
	}

}

/**
 * 
 * @param {Number} roomCode 
 * @param {Number} userID 
 * @param {String} userName
 * 
 * Queries for a Room by room code. Then uses the Room ID to check if a member has already been in the room.
 * If so, their current entry is updated to indicate they are currently joined in the room.
 * Else, create the member and add them to the members table
 */
async function updateMembers (roomCode, userID, userName) {
    const room = await Room.findOne({where: {code: roomCode}})
    const member = await Member.findOne({where: {roomid: room.dataValues.roomid, userid: userID}})
    // console.log("Member Query Results: ", member)
    if(member) {
        const updatedMember = await member.update({joined: 1})
        return updatedMember.dataValues
    }
    else{
        const newMember = await Member.create(
            {
                roomid: room.dataValues.roomid,
                userid: userID,
                joined: 1,
                name: userName
            }
        )
        return newMember.dataValues
    }

    
}
/**
 * Queries for a Room by room code. Then uses the Room ID to check if the room has settings. If it does, updates 
 * them. If not, creates the room's settings.
 * @param {*} roomCode 
 * @param {*} roomSettings 
 */
async function updateRoomSettings (roomCode,roomSettings) {
    const room = await Room.findOne({where: {code: roomCode}})
    const settings = await Setting.findOne({where: {roomid: room.dataValues.roomid}})
    if (settings) {
        const updatedSettings = await settings.update({
            genres: roomSettings.filteredGenres,
            time_limit: roomSettings.durationFilter,
            voting: roomSettings.songVoting,
            explicit_content: roomSettings.explicit,
            accessibility: roomSettings.anyRoomCode,
            streamingService: roomSettings.streamingService
        })
        return updatedSettings.dataValues
    }
    else{
        const newSettings = await Setting.create(
            {
                roomid: room.dataValues.roomid,
                genres: roomSettings.filteredGenres,
                time_limit: roomSettings.durationFilter,
                voting: roomSettings.songVoting,
                explicit_content: roomSettings.explicit,
                accessibility: roomSettings.anyRoomCode,
                streamingService: roomSettings.streamingService 
            }
        )
        return newSettings.dataValues
    }

}
/**
 * Wrapper for getting settings, for use in frontend via route
 * @param {*} req 
 * @param {*} res 
 */
const getSettings = async(req, res) =>{
    
    var roomId = req.query.roomId || null;
    //console.log("Calling getsettings: ", roomId)
    try{
        res.json(await getRoomSettings(roomId))
    } catch (error){
        console.error('Error:', error);
		res.status(500).json({ error: 'Internal Server Error' });
    }
}
/**
 * 
 * @param {*} roomCode 
 * @returns the room settings of the room with the specified room id
 */
const getRoomSettings = async (roomId) => {
    
    return Setting.findOne({
        where: {
            roomid: roomId,
        }
    }).then((query) => {
        if (query) {
            //console.log(query.dataValues);
            return {
                status: 200,
                message: "Successfully acquired room settings",
                error: null,
                filteredGenres: query.dataValues.genres.split(","),
                explicit: query.dataValues.explicit_content,
                durationFilter: query.dataValues.time_limit,
                anyRoomCode: query.dataValues.accessibility,
                songVoting: query.dataValues.voting,
                streamingService: query.dataValues.streamingService
            }
        }else {
            return {
                status: 500,
                message: "Settings not found for given room id",
                error: `No Settings Found`
            }
        }
    }).catch(error => {
        console.error(error);
        return {
            status: 500,
            message: "Error occured while fetching room Settings",
            error: error,
        }
    });
}
/**
 * 
 * @param {Number} userID 
 * @returns an updated entry in the members table indicating that a member has left the room. The joined column
 * gets changed to false
 */
const leaveRoom = async (userID) => {
    if(userID){
    const member = await Member.findOne({
        where: {
            userid: userID,
            joined: 1
        }
    })
    if(member) {
        console.log("LEAVING ROOM, UID: ",userID)
        return await member.update({joined: 0})
    }else{
        console.log("NOT FOUND, UID: ",userID)
    }
    }
    
}
/**
 * Wrapper for getting room code, for use in frontend via route
 * @param {*} req 
 * @param {*} res 
 */
const getRoomID = async (req, res) => {
    var userId = req.query.userID || null
    try{
        res.json({roomId: await getMyRoomID(userId)})
    } catch (error){
        console.error('Error:', error);
		res.status(500).json({ error: 'Internal Server Error' });
    }
}

/**
 * 
 * @param {Number} userID 
 * @returns The room code for the room that a member is in
 */
const getMyRoomCode = async (userID) => {
    if(userID){
    const member = await Member.findOne({
        where: {
            userid: userID,
            joined: 1
        }
    })
    if(member) {
        const room = await Room.findOne({
            where: {
                roomID: member.dataValues.roomid
            }
        })
        //console.log("my code found: ", room.dataValues.code, userID)
        return room.dataValues.code
    }else{
        console.log("member not found: ", userID)
    }
    }else{
        console.log("member undefined") 
    }
}

/**
 * Retrieves the room ID associated with a given user ID.
 * @param {number} userID - The ID of the user.
 * @returns {Promise<number|undefined>} - The room ID if found, otherwise undefined.
 */
const getMyRoomID = async (userID) => {
    const member = await Member.findOne({
        where: {
            userid: userID,
            joined: 1
        }
    })
    if(member) {
        return member.dataValues.roomid;
    }
}

/**
 * Retrieves the Spotify account ID associated with a given room ID.
 * @param {string} room_id - The ID of the room.
 * @returns {Promise<Object>} - A promise that resolves to an object containing the status, error, and Spotify account ID.
 */
const getSpotifyAccountID = async (room_id) => {
	return await Room.findOne({
		where: {
			roomid: room_id
		}
	}).then((query) => {
		if (query){
			return {
				status: 200,
				error: null,
				spotify_id: query.dataValues.spotify_account,
			}
		}else {
			return {
				status: 500,
				error: 'no account found',
				spotify_id: null,
			}
		}
	})
}

/**
 * Retrieves the Spotify access token for a given user ID.
 * @param {string} userID - The ID of the user.
 * @returns {Promise<object>} - The Spotify account object containing the access token.
 */
const getSpotifyAccessToken = async (room_id) => {
	const spotifyID = await getSpotifyAccountID(room_id);
	console.log("Spotify account id retrieved:", spotifyID)
	const account = await dbController.getSpotifyTokenByID(spotifyID.spotify_id);
	return account;
}

/**
 * Retrieves the room code for a given user ID.
 * 
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the room code is retrieved.
 */
const getRoomCode = async (req, res) => {
	const userID = req.params.userID;

	const code = await getMyRoomCode(userID);

	if (code != null || code != undefined){
		res.status(200).json({
			status: 200,
			message: 'Successfully acquired room code',
			code: code
		})
	}else {
		res.status(500)
	}
}
/**
 * Wrapper for getRoomAnimals
 * Retrieves the connected party animals for the room.
 * 
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the room code is retrieved.
 */
 const getAnimals = async (req, res) => {
	const roomID = req.params.roomID;
	try{
        res.json(await getRoomAnimals(roomID))
    } catch (error){
        console.error('Error:', error);
		res.status(500).json({ error: 'Internal Server Error' });
    }
}


/**
 * Retrieves the list of party animals in a given room.
 * 
 * @param {number} room_id - The ID of the room.
 * @returns {Promise<Object>} - A promise that resolves to an object containing the status, message, error, and partyAnimalList.
 */
const getRoomAnimals = async (room_id) => {
    const partyAnimalList = [];

	try {
		const animals = await Member.findAll({
			where: {
				roomid: room_id,
				joined: true	
			}
		})
		//console.log("Party Animals found in room: ", animals)
		//console.log("Party Animals found in room length: ", animals.length)
		if(animals != undefined && animals.length > 0){
			animals.forEach(animal => {partyAnimalList.push(animal.dataValues)})
			return {
				status: 200, 
				message: "Successfully acquired connected party animals", 
				error: null, 
				partyAnimalList: partyAnimalList
			}
		}else{
			return {
				status: 200, 
				message: "Room is empty", 
				error: null, 
				partyAnimalList: []
			}
		}
	} catch (error) {
		console.log(error)
		return {
			status: 500, 
			message: "Something went wrong trying to get the party animals", 
			error: error, 
			queue: []
		}
	}
}

/**
 * Generates a summary for a room.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the summary is generated and sent as a response.
 */
const generateRoomSummary = async (req, res) => {
	const roomID = req.params.roomID;

	// Get number of songs played + most popular song + genre + DJ
	const summary = await dbController.generateRoomSummary(roomID);
	console.log(summary)
	if (summary){
		res.status(summary.status).json(summary);
	}
}

module.exports = {
	createRoom,
    updateMembers,
    leaveRoom,
    getMyRoomCode,
	getMyRoomID,
    checkRoomExistsByCode,
	getSpotifyAccessToken,
    getRoomID,
    checkRoomExistsByCode,
    updateRoomSettings,
    getRoomSettings,
    getSettings,
	getRoomCode,
    getAnimals,
	generateRoomSummary,
    getRoomAnimals
}
