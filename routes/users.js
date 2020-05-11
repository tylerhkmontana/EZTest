const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");

// User model
const User = require("../models/User");
const { forwardAuthenticated, ensureAuthenticated } = require("../config/auth");

// Login Page
router.get("/login", forwardAuthenticated, (req, res) => {
  res.render("login");
});

// Register Page
router.get("/register", forwardAuthenticated, (req, res) => {
  res.render("register");
});

// Login with google
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile"] })
);

// Let the authenticated user to the dashboard
router.get(
  "/auth/google/dashboard",
  passport.authenticate("google", { failureRedirect: "/users/login" }),
  ensureAuthenticated,
  (req, res) => {
    // Successful authentication, redirect home.
    res.render("dashboard", { user: `${req.user.name}[${req.user.usertype}]` });
  }
);

router.get("/student/course", ensureAuthenticated, (req,res) => {
  const user = `${req.user.name}[${req.user.usertype}]`
  res.render("course", { user })
})

// Register Handle
router.post("/register", (req, res) => {
  const { name, email, password, password2, facultyid, usertype } = req.body;
  let errors = [];

  // Check required fields
  if (!name || !email || !password || !password2 || !facultyid) {
    errors.push({ msg: "Please fill in all fields" });
  }

  // Check passwords match
  if (password !== password2) {
    errors.push({ msg: "Passwords do not match" });
  }

  // Check pass length
  if (password.length < 6) {
    errors.push({ msg: "Password should be at least 6 characters" });
  }

  // Aussimng all faculty id has 8 digits and check the length
  if (facultyid.length !== 8) {
    errors.push({ msg: "Student/Faculty id# must be 8 digits" });
  }

  if (errors.length > 0) {
    res.render("register", {
      errors,
      name,
      email,
      password,
      password2,
      facultyid,
    });
  } else {
    // Validation passed
    User.findOne({ email: email.toLowerCase() })
      .then((user) => {
        if (user) {
          // User exists
          errors.push({ msg: "This email is already registered" });
          res.render("register", {
            errors,
            name,
            email,
            password,
            password2,
            facultyid,
          });
        } else {
          const newUser = new User({
            name,
            email,
            password,
            facultyid,
            usertype,
          });

          // Hash Password
          bcrypt.hash(newUser.password, 10, (err, hash) => {
            if (err) throw err;
            // Set password to hash
            newUser.password = hash;
            // Save user
            newUser
              .save()
              .then((user) => {
                req.flash(
                  "success_msg",
                  "You are now registered and can log in"
                );
                res.redirect("/users/login");
              })
              .catch((err) => console.log(err));
          });
        }
      })
      .catch((err) => console.log(err));
  }
});

// Login Handle
router.post("/login", (req, res, next) => {
  User.findOne({email: req.body.email.toLowerCase()})
   .then(user => {
     if(user){
       if(user.usertype === "Instructor"){
        passport.authenticate("local", {
          successRedirect: "/instructor/dashboard",
          failureRedirect: "/users/login",
          failureFlash: true,
        })(req, res, next);
         console.log("You are instructor")
       } else {
        passport.authenticate("local", {
          successRedirect: "/student/dashboard",
          failureRedirect: "/users/login",
          failureFlash: true,
        })(req, res, next);
         console.log("You are student")
       }
     } else {
       req.flash("error_msg", "User not found")
       res.redirect("/users/login")
     }
   })
   .catch(err => console.log(err))
});

// Logout Handle
router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success_msg", "You are logged out");
  res.redirect("/users/login");
});

module.exports = router;
