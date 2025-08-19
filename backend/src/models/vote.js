const { Sequelize, DataTypes } = require('sequelize')
const sequelize = require('../utils/dbConnect');

const Vote = sequelize.sequelize.define('votes', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
		autoIncrement: true,
    },
	room_id: {
		type: DataTypes.INTEGER,
        allowNull: false,
        foreignKey: true,
        references: {
            model: 'rooms',
            key: 'roomId'
        }
	},
	song_id: {
		type: DataTypes.INTEGER,
		allowNull: false,
		foreignKey: true,
		references: {
			model: 'songs',
			key: 'id',
		}
	},
	user_id: {
		type: DataTypes.INTEGER,
		allowNull: false,
		foreignKey: true,
		references: {
			model: 'users',
			key: 'id',
		}
	},
	upvote: {
		type: DataTypes.BOOLEAN,
		allowNull: true,
		defaultValue: false
	},
	downvote: {
		type: DataTypes.BOOLEAN,
		allowNull: true,
		defaultValue: false
	},
	novote: {
		type: DataTypes.BOOLEAN,
		allowNull: true,
		defaultValue: false
	}
}, {
    tableName: 'votes',
    createdAt: false,
    updatedAt: false
});

module.exports = {
	Vote
}