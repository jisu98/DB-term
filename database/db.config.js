const mysql = require('mysql2/promise');
const config = require('./db.info').local;

module.exports = () => {
    return {
        init: () => {
            return mysql.createPool({
                host    : config.host,
                user    : config.user,
                password: config.password,
                database: config.database
            })
        }
    }
};