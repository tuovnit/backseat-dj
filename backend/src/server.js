const express = require('express');
const cors = require('cors');
const helpers = require('./utils/helper');
const database = require('./utils/dbConnect');
const roomController = require("./controllers/roomController");
const dbController = require("./controllers/dbController");
const spotifyController = require("./controllers/spotifyController");

/* -------------------------------- Load Models -------------------------------- */
const models = require('./models/loadModels')

/* -------------------------------- Required Routes -------------------------------- */
const spotifyRoutes = require('./routes/spotifyRoutes');
const queueRoutes = require('./routes/queueRoutes');
const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');
const soundcloudRoutes = require('./routes/soundcloudRoutes');
const userRoutes = require('./routes/userRoutes');
const bodyParser = require('body-parser');
require('dotenv').config();

//Middleware 
const app = express();
app.use(cors())
app.use(bodyParser.json());

/* -------------------------------- API URLs -------------------------------- */
const hostname = process.env.HOSTNAME;
const port = process.env.PORT;

/* -------------------------------- Routes -------------------------------- */
// All spotify routes are routed to the spotify router (e.g. /spotify/spotify-auth)
app.use('/spotify', spotifyRoutes);
// All queue routes
app.use('/queue', queueRoutes);
// User routes (for collecting user info etc.)
app.use('/user', userRoutes);
// Database Routes
app.use('/authenticate', authRoutes);
// room Route
app.use('/room', roomRoutes)
// Soundcloud Routes
app.use('/soundcloud', soundcloudRoutes);


/**
 * ******
 * Only use { alter: true } if changes were made to the models and the changes need to be synced to the database.
 * *********
*/
// database.sequelize.sync({alter: true});
database.sequelize.sync();

/* -------------------------------- Sockets -------------------------------- */
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');
const { error } = require('node:console');
const { stat } = require('node:fs');
const { disconnect } = require('node:process');

const server = createServer(app);
const io = new Server(server);

io.on('connection', (socket) => {
    console.log(`User ${socket.id} connected.`);

    socket.on('disconnect', async () => {
        console.log(`User ${socket.id} disconnecting.`)

		let code = roomController.getMyRoomCode(socket.userID)
		.then(result => {
			console.log("Code found: ", result)
			if (result) {
				roomController.leaveRoom(socket.userID)
				.then(() => {
					socket.leave(code)
					console.log("Left the Room")
				})
			}
			else{
				console.log("Else left room")
			}
		})
    });

	/**
	 * Triggers the function to create a room, and then add the user who created it
	 * to the members table. This user is the host
	 */
	socket.on('createRoom', async (userID, name, roomSettings, service, callback) => {
		console.log('Create room socket handler working.')
		socket.userID = userID
	
		try { 
			const code = await helpers.generateRoomCode()
			const createdRoom = await roomController.createRoom(userID, code, service)
			const updatedMembers = await roomController.updateMembers(createdRoom.dataValues.code, userID, name)
			const updatedSettings = await roomController.updateRoomSettings(code, roomSettings)
			if(createdRoom && updatedMembers && updatedSettings) {
				socket.join(code)
				callback({ status: 200 })
			}
			 
		} catch (error) {
			console.error(error);
			callback({ status: 500 })
		}
	});
	/**
	 * Triggers the function to create a room, and then add the user who created it
	 * to the members table. This user is the host
	 */
	socket.on('updateSettings', async (userID, roomSettings, callback) => {
		console.log('Update Settings socket handler working.')
		try { 
			const code = await roomController.getMyRoomCode(userID)
			const updatedSettings = await roomController.updateRoomSettings(code, roomSettings)
			if(updatedSettings) {
				socket.to(code).emit('refreshQueue', "Settings have changed")
				callback({ status: 200 })
			}
			 
		} catch (error) {
			console.error(error);
			callback({ status: 500 })
		}
	});
	/**
	 * Triggers the function to update the member table indicating a user
	 * has joined the room
	 */
	socket.on('joinRoom', async (userID, userName, roomCode, callback) => {
		console.log(`${userName}(${userID}) is joining room: ${roomCode}`)
		const code = Number(roomCode)


		// Case where a user has an account
		if (userID != null && userName != null) {
			const updatedMembers = await roomController.updateMembers(roomCode, userID, userName)
			if(updatedMembers) {
				socket.join(code)
				socket.userID = userID
				callback({ status: 200 })
				clients = await io.sockets.in(code).fetchSockets()
				clients.forEach(client => {console.log("IN MANAGEROOM Client UserID: ", client.userID)})
				socket.to(code).emit('refreshAnimals', "Hello new user")
				socket.to(code).emit('refreshManageAnimals', "Hello new user")
				socket.emit('refreshAnimals', "Hello new user")
				socket.emit('refreshManageAnimals', "Hello new user")
			}
		}
		// Case where Joining without an account
		else{
			const guestPartyAnimal = await helpers.generateRandomGuestName()
			const user = await dbController.createGuestUser(guestPartyAnimal)
			console.log("Guest User: ", user)
			const updatedMembers = await roomController.updateMembers(roomCode, user.id, user.name)
			if(updatedMembers) {
				socket.join(code)
				socket.userID = user.id
				callback({ status: 200, user: user })
				clients = await io.sockets.in(code).fetchSockets()
				clients.forEach(client => {console.log("IN MANAGEROOM Client UserID: ", client.userID)})
				socket.to(code).emit('refreshAnimals', "Hello new user")
				socket.to(code).emit('refreshManageAnimals', "Hello new user")
				socket.emit('refreshAnimals', "Hello new user")
				socket.emit('refreshManageAnimals', "Hello new user")
			}
		}
		// const updatedMembers = await roomController.updateMembers(roomCode, userID, userName)
		// if(updatedMembers) {
		// 	socket.join(code)
		// 	socket.userID = userID
		// 	callback({ status: 200 })
		// }

	})

	/**
	 * Triggers the function to update the members table to indicate that a
	 * user has left the room
	 */
	socket.on('leaveRoom', async (userID) => {
        console.log("Leaving Room")
		const code = await roomController.getMyRoomCode(userID)
		await roomController.leaveRoom(userID)
		clients = await io.sockets.in(code).fetchSockets()
		clients.forEach(client => {console.log("IN MANAGEROOM Client UserID: ", client.userID)})
		socket.to(code).emit('refreshAnimals', "Goodbye User")
		socket.to(code).emit('refreshManageAnimals', "Goodbye User")
		socket.emit('refreshAnimals', "Goodbye User")
		socket.emit('refreshManageAnimals', "Goodbye User")
		socket.leave(code)
		socket.disconnect()
		console.log("Left the Room")

    });
	/**
	 * Triggers the function to update the members table to indicate that a
	 * user has left the room
	 */
	socket.on('deleteRoom', async (roomID, roomCode) => {
        console.log("Deleting room: ", roomCode)
		const code = Number(roomCode)
		const roomAnimals = await roomController.getRoomAnimals(roomID)
		//console.log("IN ROOM: ", roomID, roomAnimals)
		roomAnimals.partyAnimalList.forEach(async user => {
			//console.log("IN ROOM: ", user)
			await roomController.leaveRoom(user.userid)
			//console.log("EMITTING")
		})
		
		//clients = await io.in(code).fetchSockets()
		//clients.forEach(client => {console.log("YY ", client.userID)})
		io.to(code).emit('roomClosed', roomID)
		io.socketsLeave(code)
		
		

    });
	/**
	 * Triggers the function to update the members table to indicate that a
	 * user has left the room
	 */
	socket.on('kick', async (userID) => {
        console.log("Kicking from Room")
		const code = Number(await roomController.getMyRoomCode(userID))
		await roomController.leaveRoom(userID)
		clients = await io.sockets.in(code).fetchSockets()
		//clients.forEach(client => {console.log("IN MANAGEROOM Client UserID: ", client.userID)})
		socket.emit('kickingAnimal', userID)
		socket.to(code).emit('kickingAnimal', userID)
		socket.emit('refreshManageAnimals', "Goodbye User")
		socket.to(code).emit('refreshManageAnimals', "Goodbye User")
		//socket.leave(code) //socket leaves in the frontend
		console.log("Left the Room")

    });
	/**
	 * Represents the queue of items.
	 * @type {Array}
	 */
	socket.on('getQueue', async (userID, callback) => {
		console.log("fetching queue")
		const roomID = await roomController.getMyRoomID(userID)
		const queue = await dbController.getQueue(roomID)
		console.log(`queue for room ${roomID}: `, queue);
		callback({ queue: queue })
	});

	/**
	 * The results of the song search with token.
	 * @type {Array}
	 */
	socket.on('searchSpotifySong', async (userID, input) => {
		console.log("searching spotify song:", input)
		// fetch spotify token
		const token = await roomController.getSpotifyAccessToken(userID);
		console.log("token: ", token);
		// search song (pass in spotify token)
		const results = await spotifyController.songSearchWithToken(input, token)
		return results;
	});

	
	socket.on('addSong', async (userID, songID, songTitle, songArtist, albumTitle, albumImage, explicit, previewURL, duration_ms, callback) => {
		// get room info: roomID and code
		console.log("USERID: ", userID)
		const roomID = await roomController.getMyRoomID(userID)
		console.log("ROOMID: ", roomID)
		const code = await roomController.getMyRoomCode(userID)
		console.log("ROOMCODE: ", code)
		//add the song to queue
		const result = await dbController.addSongToQueue(roomID, songTitle, songArtist, albumTitle, songID, albumImage, explicit, 0, await dbController.getMyUsername(userID), duration_ms, null)
		if (result.status === 200) {
			callback(result)
		}
		else{
			callback(result)
		}

		clients = await io.sockets.in(code).fetchSockets()
		clients.forEach(client => {console.log("IN ADD SONG Client UserID: ", client.userID)})
		socket.to(code).emit('refreshQueue', "Hello other user")
		socket.to(code).emit('refreshAnimals', "Hello new user")
		
		
	})
	
	socket.on('currentlyPlaying', async (userID, callback) => {
		const code = await roomController.getMyRoomID(userID);
		const code2 = await roomController.getMyRoomCode(userID)
		const song = await dbController.getCurrentlyPlaying(code)
		.then((response) => {
			console.log(response);
			socket.to(code2).emit('refreshQueue', "Hello other user")
			socket.emit('refreshQueue', "Hello other user")
			callback(response)
		})
	})
	
	socket.on('skipSong', async (userID, callback) => {
		const code = await roomController.getMyRoomID(userID)
		const code2 = await roomController.getMyRoomCode(userID)
		const song = await dbController.skipSong(code)
		.then(async (response) => {
			console.log(response)
			const clients = await io.sockets.in(code2).fetchSockets()
			clients.forEach(client => {console.log("IN SKIP Client UserID: ", client.userID)})
			socket.to(code2).emit('refreshQueue', "Hello other user")
			socket.emit('refreshQueue', "Hello other user")
			callback(response)
		})
		
	})
	
	socket.on('removeSong', async (user_id, song_id, callback) => {
		const code = await roomController.getMyRoomCode(user_id)
		// remove song from db
		await dbController.removeSongFromQueue(song_id)
		.then((response) => {
			if (response.status == 200){
				callback(response)
				// emit update to room to refresh queue
				socket.emit('refreshQueue', "Hello other user")
				socket.to(code).emit('refreshQueue', "Hello other user")
			}else {
				callback(response)
			}
		})
	})

	socket.on('upVote', async (user_id, song_id, up, down, callback) => {
		const code = await roomController.getMyRoomCode(user_id)
		console.log("code: ", code)
		const vote = await dbController.checkVoteExists(await roomController.getMyRoomID(user_id), song_id, user_id);
		console.log("vote: ", vote)
		const voteCount = await dbController.castVote(vote.vote, up, down).then(async (result) => {
			console.log("RESULT: ", result)
			if (result.status == 200){
				await dbController.updateSongVoteCount(song_id, result.change).then(async (response) => {
					console.log("My Room code: ", typeof code, code)
					const clients = await io.sockets.in(code).fetchSockets()
					clients.forEach(client => {console.log("IN UP VOTE Client UserID: ", client.userID)})
					socket.to(code).emit('refreshQueue', "Hello other user")
					socket.emit('refreshQueue', "Hello other user")
					callback(response)
				})
			}else {
				callback(result);
			}
		});
	})
	
	socket.on('downVote', async (user_id, song_id, up, down, callback) => {
		const code = await roomController.getMyRoomCode(user_id)
		const vote = await dbController.checkVoteExists(await roomController.getMyRoomID(user_id), song_id, user_id);
		console.log(vote)
		const voteCount = await dbController.castVote(vote.vote, up, down).then(async (result) => {
			if (result.status == 200){
				await dbController.updateSongVoteCount(song_id, result.change).then(async (response) => {
					console.log("My Room code: ", typeof code, code)
					const clients = await io.sockets.in(code).fetchSockets()
					clients.forEach(client => {console.log("IN DOWN VOTE Client UserID: ", client.userID)})
					socket.to(code).emit('refreshQueue', "Hello other user")
					socket.emit('refreshQueue', "Hello other user")
					callback(response)
				})
			}else {
				callback(result);
			}
		});
	})
})

/* -------------------------------- Listener -------------------------------- */
server.listen(port, () => {
	console.log(`App listening on port ${port}`)	
});

module.exports = {
	hostname
}