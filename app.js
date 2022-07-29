require('dotenv').config()
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption")

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});


userSchema.plugin(encrypt,{secret:process.env.SECRET,encryptedFields: ["password"] });

const User = mongoose.model("User", userSchema);


app.get("/", (req, res) => {
    res.render("home");
});
app.get("/login", (req, res) => {
    res.render("login");
});
app.get("/register", (req, res) => {
    res.render("register");
});


app.post("/register", (req, res) => {
    const user = new User({
        email: req.body.username,
        password: req.body.password
    });
    user.save(function (err) {
        if (!err) {
            console.log("successfully registered");
            res.render("secrets");
        }
        else {
            console.log(err);
        }
    });
});

app.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({ email: username }, function (err, foundUser) {
        if (err) {
            console.log(err);
        }
        else {
            if (foundUser.password === password) {
                res.render("secrets");
            }
        }
    });

});

app.listen(3000, function () {
    console.log("server running on port 3000")
});