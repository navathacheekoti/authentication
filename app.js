const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const passportLocalMongoose = require("passport-local-mongoose");
const User = require("./user");
const app = express();
//connecting to mongoose
mongoose.connect("mongodb://localhost/authentication");

app.use(
    require("express-session")({
        secret: "Sai is the and",
        resave: false,
        saveUninitialized: false
    })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//show home page
app.get("/", (req, res) => {
    res.render("home");
});
//show secret page
const isLoggedin = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
};
app.get("/secret", isLoggedin, (req, res) => {
    res.render("secret");
});
//show register page
app.get("/register", (req, res) => {
    res.render("register");
});

//handling register
app.post("/register", (req, res) => {
    const { username, email, password } = req.body;
    User.register(new User({ username, email }), password, (err, user) => {
        if (err) {
            console.log(err);
            return res.render("register");
        }
        passport.authenticate("local")(req, res, () => {
            res.redirect("/secret");
        });
    });
});
//login Routes
app.get("/login", (req, res) => {
    res.render("login");
});
app.post(
    "/login",
    passport.authenticate("local", {
        successRedirect: "/secret",
        failureRedirect: "/login"
    }),
    (req, res) => {}
);
//logout Routes
app.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
});

app.listen(3000, () => console.log("working in port 3000"));
