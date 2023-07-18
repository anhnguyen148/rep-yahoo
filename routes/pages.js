const express = require("express");
const auth = require("../middleware.js");

const router = express.Router();

router.get("/signup", (req, res) => {
    res.render("signup");
});

router.get("/login", (req, res) => {
    res.render("login");
});

// if token authenticated, render index page
router.get("/", auth, (req, res) => {
    // grab the value of username on request sent then render index page with username value.
    const username = req.username;
    res.render("index", {username});
});

module.exports = router;