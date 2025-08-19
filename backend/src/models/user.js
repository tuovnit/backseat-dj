const { Sequelize, DataTypes } = require('sequelize')
const sequelize = require('../utils/dbConnect');

const User = sequelize.sequelize.define('users', {
    //attributes
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    email: {
        type: DataTypes.STRING(50),
        allowNull: true
        // allowNull: false,
        // primaryKey: true
    },
    password: {
        type: DataTypes.STRING,
        // allowNull: false
        allowNull: true // allowing null so we can make "guest" accounts without a password. 
    },
    name: {
        type: DataTypes.STRING(50),
        allowNull: false
        
    },
    guest: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    }

}, {
    tableName: 'users',
    createdAt: false,
    updatedAt: false
});



module.exports = {
    User
}