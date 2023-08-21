const dotenv = require("dotenv");
const mysql = require("mysql");

// configraration with env.
dotenv.config();

exports.db = mysql.createConnection({
    host: process.env.DATABASE_HOST,    
    database: process.env.DATABASE,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD
});
