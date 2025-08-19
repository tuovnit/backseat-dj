require('dotenv').config();

// const db_hostname = process.env.LOCAL_DB_HOSTNAME;
// const db_port = process.env.DB_PORT
// const db_database = process.env.LOCAL_DB_NAME;
// const db_username = process.env.LOCAL_DB_USERNAME;
// const db_password = process.env.LOCAL_DB_PASSWORD;

const db_hostname = process.env.DB_HOSTNAME;
const db_port = process.env.DB_PORT
const db_database = process.env.DB_NAME;
const db_username = process.env.DB_USERNAME;
const db_password = process.env.DB_PASSWORD;

module.exports = {
    db_hostname,
    db_port,
    db_database,
    db_username,
    db_password
}


