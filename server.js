const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const mysql = require("mysql");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const cookieParser = require("cookie-parser");

// configraration with env.
dotenv.config();

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,    
    database: process.env.DATABASE,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD
});

db.connect((error) => {
    if (error) {
        console.log(error);
    } else {
        console.log("MySQL Connected...")
    }
})

const publicDir = path.join(__dirname, "./public");

app.use(express.static(publicDir));
// parse URL-encoded and json form bodies 
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
// define Routes
app.use("/", require("./routes/pages"));
app.use("/auth", require("./routes/auth"));

app.set("view engine", "hbs");
io.on("connection", (socket) => {
    // listen message from "newuser" type
    socket.on("newuser", (username) => {        
        // broadcast = To all connected clients except the sender
        // send message to socket.on "updtae" type on client side 
        socket.broadcast.emit("update", username + " has joined the conversation");
    });
    socket.on("exituser", (username) => {
        socket.broadcast.emit("update", username + " has left the conversation");
    });
    // listen my message from client side
    socket.on("chat", (message) => {
        // send other's message to socket.on on client side
        socket.broadcast.emit("chat", message);
    });
});

server.listen(3001, () => {
    console.log("Connected 3001");
})