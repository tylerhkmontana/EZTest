require("dotenv").config()
const express = require('express')
const expressLayouts = require("express-ejs-layouts")
const mongoose = require("mongoose")
const passport = require("passport")
const flash = require("connect-flash")
const session = require("express-session")

const app = express()

// Passport config
require("./config/passport")(passport)

// DB Config
const db = require("./config/keys").mongoURI

// Connect to Mongo
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
 .then(() => console.log("MongoDB Connected..."))
 .catch(err => console.log(err))

// EJS
app.use(expressLayouts)
app.set("view engine", "ejs")

// Bodyparser
app.use(express.urlencoded({ extended: true }))

// Express Session
app.use(session({
    secret: process.env.SECRETKEY,
    resave: true,
    saveUninitialized: true,
  })
)

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash())

// Global Vars for flash
app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg")
    res.locals.error_msg = req.flash("error_msg")
    res.locals.error = req.flash("error")
    next()
})

// Routes
app.use("/", require("./routes/index.js"))

app.use("/users", require("./routes/users.js"))


const PORT = process.env.PORT || 3000

app.listen(PORT, console.log(`Server started on ${PORT}`))