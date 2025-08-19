const { Sequelize, DataTypes } = require('sequelize')
const sequelize = require('../utils/dbConnect');

const SpotifyAccount = sequelize.sequelize.define('spotify_services', {
	id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true,
		allowNull: false,
	},
    userid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        foreignKey: true,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    access_token: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    refresh_token: {
        type: DataTypes.TEXT,
        allowNull: false
    }
}, {
    tableName: 'spotify_accounts'
});

module.exports = {
    SpotifyAccount
}