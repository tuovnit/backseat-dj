const { Sequelize, DataTypes } = require('sequelize')
const sequelize = require('../utils/dbConnect');

const Queue = sequelize.sequelize.define('queues', {
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
    number_plays: {
        type: DataTypes.INTEGER,
    },

}, {
    tableName: 'queues',
    createdAt: false,
    updatedAt: false
});

module.exports = {
    Queue
}