const { Sequelize, DataTypes } = require('sequelize')
const sequelize = require('../utils/dbConnect');

const Setting = sequelize.sequelize.define('settings', {
    roomid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        foreignKey: true,
        references: {
            model: 'rooms',
            key: 'roomid'
        }
    },
    genres: {
        type: DataTypes.TEXT(),
        allowNull: false
    },
    time_limit: {
        type: DataTypes.INTEGER
    },
    voting: {
        type: DataTypes.BOOLEAN
    },
    explicit_content: {
        type: DataTypes.BOOLEAN
    },
    accessibility: {
        type: DataTypes.BOOLEAN
    },
    streamingService: {
        type: DataTypes.STRING()
    }


}, {
    tableName: 'settings',
    createdAt: false,
    updatedAt: false
});

module.exports = {
    Setting
}