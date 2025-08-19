const querystring = require('querystring');
const dbController = require('../controllers/dbController');
require('dotenv').config();

const getUserServices = async (user_id) => {
	// Get services from current user from db
	return await dbController.getSpotifyAccount(user_id)
	.then(result => {
		if (result.status == 200){
			return {
				status: 200,
				message: "Acquired Spotify account connected to this profile",
				error: null,
				spotify: true,
			}
		}else {
			return {
				status: 200,
				message: "No Spotify Account connected to this profile",
				error: null,
				spotify: false,
			}
		}
	}).catch(err => console.error(err));
}

const getUserProfile = async (id) => {

}

module.exports = {
	getUserServices,
	getUserProfile,
}