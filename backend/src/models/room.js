const { Sequelize, DataTypes } = require('sequelize')
const sequelize = require('../utils/dbConnect');

const Room = sequelize.sequelize.define('rooms', {
    roomid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    code: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    host: {
        type: DataTypes.INTEGER,
        allowNull: false,
        foreignKey: true,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    qr_code: {
        type:  DataTypes.BLOB
    }, 
	spotify_account: {
		type: DataTypes.INTEGER,
		foreignKey: true,
		references: {
			model: 'spotify_accounts',
			key: 'id'
		}
	},
}, {
    tableName: 'rooms',
    createdAt: true,
    updatedAt: false
});

module.exports = {
    Room
}