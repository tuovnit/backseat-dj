const { Sequelize, DataTypes } = require('sequelize')
const sequelize = require('../utils/dbConnect');

const Member = sequelize.sequelize.define('members', {
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
    userid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        foreignKey: true,
        references: {
            model: 'users',
            key: 'id'
        } 
    },
    joined: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING(25),
        allowNull: false
    }

}, {
    tableName: 'members',
    createdAt: false,
    updatedAt: false
});


module.exports = {
    Member
}