const LocalStrategy = require("passport-local").Strategy
const bcrypt = require("bcryptjs")
const GoogleStrategy = require('passport-google-oauth20').Strategy
// module to use findorCreate function

// Load User Model
const User = require("../models/User")

module.exports = function(passport) {

    passport.serializeUser((user, done) => {
        console.log(user.id)
        console.log("Serialization")
        done(null, user.id);
    })
        
    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            console.log("Deserialization occurs")
            done(err, user);
        })
    })

    passport.use(
        new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
            // Match user
            User.findOne({ email: email })
             .then(user => {
                 if(!user) {
                     return done(null, false, { message: "That email is not registered" })
                 }

                // Match password
                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if (err) throw err
                    if (isMatch) {
                        return done(null, user)
                    } else {
                        return done(null, false, { message: "Password incorrect" })
                    }
                })
            })
        })
    )

    passport.use(new GoogleStrategy({
        clientID: process.env.GOAUTH_CLIENT_ID,
        clientSecret: process.env.GOAUTH_CLIENT_PASSWORD,
        callbackURL: "http://localhost:3000/users/auth/google/dashboard" || "https://sheltered-springs-08714.herokuapp.com/users/auth/google/dashboard",
        userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
      },
      (accessToken, refreshToken, profile, cb) => {
            console.log(profile)
            User.findOrCreate({ name: `${profile.name.givenName} ${profile.name.familyName}`, googleId: profile.id }, 
            (err, user) => {
            return cb(err, user);
        });
      }
    ));

    
}