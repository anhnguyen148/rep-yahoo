const mysql = require("mysql");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

exports.signup = (req, res) => {
    const {username, email, password, passwordConfirm} = req.body;
    
    // check if email is available or not
    db.query("SELECT name FROM users WHERE name = ?", [username], async (error, results) => {
        if (error) {
            console.log(error);
        } 
        if (results.length > 0) {
            return res.render("signup", {
                message: "That username has been used."
            })
        } else if (password !== passwordConfirm) {
            return res.render("signup", {
                message: "Passwords do not match."
            })
        }
        // I should check for used email here, or require more details for a strong password, but this is just a small chatbox that I share with my friends, I can check it later when I go to database so at this point I only want unique usernames.

        let hashedPassword = await bcrypt.hash(password, 8);
        db.query("INSERT INTO users SET ?", {name: username, email: email, password: hashedPassword}, (error, results) => {
            if (error) {
                console.log(error);
            } else {
                return res.render("signup", {
                    messageSuccess: "Signup successfully"
                })
            }
        });
    });
};

exports.login = (req, res) => {
    const {username, password} = req.body;

    // check username
    db.query("SELECT name FROM users WHERE name = ?;", [username], async (error, results) => {
        if (error) {
            console.log(error);
        }
        if (results.length === 0) {
            return res.render("login", {
                message: "Invalid username."
            })
        } else if (results.length === 1) {
            // check password
            db.query("SELECT * FROM users WHERE name = ?;", [username], async (error, results) => {
                if (error) {
                    console.log(error);
                } else {
                    const dbPassword = results[0].password;
                    bcrypt.compare(password, dbPassword, async (error, isMatch) => {
                        if (error) {
                            console.log(error);
                        } 
                        if (!isMatch) {                            
                            return res.render("login", {
                                message: "Wrong password."
                            })
                        } else if (isMatch) {
                            // create token
                            user = {
                                id: results[0].id,
                                username: results[0].name
                            }
                            // grant token for user
                            const token = jwt.sign(user, process.env.SECRET_KEY, {expiresIn: process.env.TOKEN_EXPIRE});
                            cookieOptions = {
                                httpOnly: true, 
                                secure: true // only work on httpS
                            }
                            // store token on cookie so user can access to chatroom, this stage will be performed in middleware.js
                            res.cookie("registeredUser", token);
                            return res.redirect("http://localhost:3001/");
                        }
                    });
                }
            });
        }
    });
}

exports.logout = (req, res) => {
    res.clearCookie('registeredUser');
    res.redirect('/login');
}


