const jwt = require('jsonwebtoken');
const mysql = require("mysql");
const dbConn = require("./db");

const db = dbConn.db;

const tokenCheck = (req, res, next) => {
    // get token from user's cookie
    const token = req.cookies.registeredUser;
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.SECRET_KEY);
            const userId = decoded.id;
            db.query("SELECT id FROM users WHERE id = ?;", [userId], async (error, results) => {
                if (error) {
                    console.log(error);
                } else if (results.length == 1) {
                    console.log("Retrieve token successfully", decoded);
                    // attach the username to request sends to server
                    req.username = decoded.username;
                    req.userId = decoded.id;
                    next();
                }
            });
        } catch (error) {
            res.status(401).send({error: "Please login to join our chatroom"});
        }
    // if no token, redirect to login page
    } else {
        console.log("Unauthenticated token")
        res.redirect('/login');
    }
    

    
}

module.exports = tokenCheck;