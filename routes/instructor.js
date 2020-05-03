const express = require("express");
const router = express.Router();
const Course = require("../models/Course")
const { ensureAuthenticated } = require("../config/auth");

router.get("/dashboard", ensureAuthenticated, (req, res) =>
  res.render("dashboard", {
    user: `${req.user.name}[${req.user.usertype}]`, usertype: req.user.usertype
  })
);

router.post("/dashboard", (req, res) => {
  let section
  req.body.days.forEach((day, index) => {
    if(index === 0){
      section = day
    } else {
      section = section + `/${day}`
    }
  })

  section = `${section} ${req.body.courseTime[0]}-${req.body.courseTime[1]}`
  const newCourse = Course({
    courseName: req.body.courseName,
    section: section,
    semester: `${req.body.semester} ${req.body.year}`,
    instructorName: req.user.name,
    instructorId: req.user._id
  })
  newCourse.save()
   .then(course => {
      res.redirect("/instructor/dashboard")
   })
   .catch(err => console.log(err))
  
})

module.exports = router