const { Sequelize } = require('sequelize');
const config = require('./config')

//Connect to database
const sequelize = new Sequelize(config.db_database, config.db_username, config.db_password, {
    host: config.db_hostname,
    port: config.db_port,
    dialect: 'mysql',
    logging: false
});


//Verifies a connection was made
sequelize.authenticate().then(() => {
    console.log("Database connection: Success");
}).catch((err) => {
    console.log("Error connecting to database");
})

//Shows all the tables in database
sequelize.getQueryInterface().showAllSchemas().then((tableObj) => {
    console.log('\n', '==========================', 'Tables in database', '==========================');
    console.log(tableObj);
})
.catch((err) => {
    console.log('showAllSchemas ERROR',err);
})


module.exports = {
    sequelize
}