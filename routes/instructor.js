const express = require("express");
const router = express.Router();
const Course = require("../models/Course")
const CourseParticipant = require("../models/CourseParticipant")
const { ensureAuthenticated } = require("../config/auth");

// login as an instructor
router.get("/dashboard", ensureAuthenticated, (req, res) => {
  Course.find({ instructorId: req.user._id }, (err, course) => {
    if (err) {
      console.log(err)
    }

    res.render("dashboard", {
      user: `${req.user.name}[${req.user.usertype}]`, usertype: req.user.usertype,
      courses: course
    })
  })
  
});

// Handle delete course
router.post("/course/:id", (req, res) => {
  const courseId = req.params.id
  CourseParticipant.deleteMany({courseId}, (err, result) => {
    if (err) {
      console.log(err)
    }
    Course.deleteOne({_id: courseId}, (err, result) => {
      if(err) {
        console.log(err)
      }
      req.flash("success_msg", "The course has been successfully deleted")
      res.redirect("/instructor/dashboard")
    })
  })
})

// Save newly created course information
router.post("/dashboard", (req, res) => {
  let section
  if(Array.isArray(req.body.days)) {
    req.body.days.forEach((day, index) => {
      if(index === 0){
        section = day
      } else {
        section = section + `/${day}`
      } 
    })
  } else {
    section = req.body.days
  }
  

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
      req.flash("success_msg", "The course has been successfully created")
      res.redirect("/instructor/dashboard")
   })
   .catch(err => console.log(err))
  
})

module.exports = router