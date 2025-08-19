const Sequelize = require('sequelize');
const { json } = require('body-parser');
const { Room } = require('../models/room');
const { animals, adjectives } = require('./lists')

/**
 * 
 * @returns A random six digit number
 */
const generateRoomCode = async () => {
	while(true) {
		let code = Math.floor(100000 + Math.random() * 900000)
		console.log("Code Generated: ", code)
		let room = await Room.findOne(
			{
				where: {
					code: code
				}
		})
		if(room) {
			console.log("Found room with code:", room)
			continue
		}else{
			return code
		}
 
	}
}
/**
 * 
 * @returns A random animal with "Anonymous" prepended to it
 */
const generateRandomGuestName = async () => {
	//const index = Math.random() * lists.animals.length
	const randAnimal = animals[Math.floor(Math.random() * animals.length)]
	const randAdjective = adjectives[Math.floor(Math.random() * adjectives.length)]
	const adj = randAdjective.charAt(0).toUpperCase() + randAdjective.slice(1)
	console.log("Selected animal: ", randAnimal)
	console.log("Selected animal: ", adj)
	return adj + randAnimal
}


/**
 * 
 * @param {Number} length 
 * @returns A Random string using alphanumeric values of length provided
 */
const generateRandomString = (length) => {
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	const values = crypto.getRandomValues(new Uint8Array(length));
	return values.reduce((acc, x) => acc + possible[x % possible.length], "");
}




module.exports = {
	generateRandomString,
	generateRoomCode,
	generateRandomGuestName
}