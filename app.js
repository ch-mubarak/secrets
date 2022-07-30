require('dotenv').config()
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport")
const passportLocalMongoose = require("passport-local-mongoose")

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    secret: String,
    isAdmin: Boolean
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", (req, res) => {
    if (req.isAuthenticated()) {
        res.redirect("/secrets")
    }
    else {
        res.render("home");
    }

});

app.get("/login", (req, res) => {
    if (req.isAuthenticated()) {
        res.redirect("/secrets")
    }
    else {
        res.render("login");
    }
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.get("/secrets", function (req, res) {
    User.find({ "secret": { $ne: null } }, function (err, foundUsers) {
        if (err) {
            console.log(err)
        }
        else {
            if (foundUsers) {
                res.render("secrets", { usersWithSecrets: foundUsers })
            }
        }
    });
});

app.get("/submit", function (req, res) {
    if (req.isAuthenticated()) {
        res.render("submit")
    }
    else {
        res.redirect("/login")
    }

})

app.get("/logout", function (req, res) {
    req.logout(function (err) {
        if (err) {
            console.log(err)
        }
    });
    res.redirect("/");
})


app.get("/admin", function (req, res) {

    if(req.isAuthenticated()){

        if (req.user.isAdmin === true) {
    
            User.find(({}, function (err, foundUsers) {
    
                if (err) {
                    console.log(err)
                }
                else {
                    if (foundUsers) {
    
                        res.render("admin", { userDB: foundUsers })
                    }
                }
            }))
        }
        else(res.redirect("/"))
    }


    else {
        res.redirect("/");
    }

})


app.post("/register", (req, res) => {

    User.register({ username: req.body.username, name: req.body.name, isAdmin: false }, req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            res.redirect("/register")
        }
        else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/secrets")
            })
        }
    })

});


app.post('/login',
    passport.authenticate('local', { failureRedirect: '/login' }),
    function (req, res) {
        res.redirect('/secrets');
    });


app.post("/submit", (req, res) => {
    const submittedSecret = req.body.secret

    User.findById(req.user.id, function (err, foundUser) {
        if (err) {
            console.log(err)
        }
        else {
            if (foundUser) {
                foundUser.secret = submittedSecret
                foundUser.save()
                res.redirect("/secrets")
            }
        }
    })

})

app.get("/delete/:id", function (req,res) {

    User.findByIdAndRemove(req.params.id,(err)=>{
        if(!err){
            console.log("successfully removed")
        }
    })
    res.redirect("/admin")
  
})

app.get("/update/:id",function(req,res){

    

})




app.listen(3000, function () {
    console.log("server running on port 3000")
});