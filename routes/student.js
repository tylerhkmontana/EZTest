const express = require("express");
const router = express.Router();
const Course = require("../models/Course")
const CourseParticipant = require("../models/CourseParticipant")
const Assignment = require("../models/Assignment")
const { ensureAuthenticated } = require("../config/auth");

// login as a student
router.get("/dashboard", ensureAuthenticated, (req, res) =>
  // Find all the courseParticipant informations associated with the user_id
  CourseParticipant.find({ studentId: req.user._id },(err, participatingCourses) => {
    if (err) {
      console.log(err)
    } 
    // Informations about the courses that the student has enrolled were found
    if(participatingCourses) {
        // Pull courseIds from participatingCourses object array
      const courseIds = participatingCourses.map(participatingCourse => {
        return participatingCourse.courseId
      })

      Course.find({ '_id': { $in: courseIds}}, (err, courses) => {
        if (err) {
          console.log(err)
        }
        // Courses that the student enrolled in were found
        if (courses) {
          res.render("dashboard", {
            user: req.user.name, usertype: req.user.usertype,
            courses: courses
          })
        // CourseIds were found but could not find any course associated with the courseIds
        } else {
          console.log("There is an error between Course collections and CourseParticipant collections")
        }
      })
    // No course found associated with the student_id
    } else {
      res.render("dashboard", {
        user: `${req.user.name}[${req.user.usertype}]`, usertype: req.user.usertype,
        courses: []
      })
    }
  })  
);

// Handle drop course
router.post("/course/:courseid", (req, res) => {
  const courseId = req.params.courseid
  const studentId = req.user._id
  CourseParticipant.deleteOne({courseId, studentId }, (err, result) => {
    if (err) {
      console.log(err)
    }
    req.flash("success_msg", "You successfully dropped the course.")
    res.redirect("/student/dashboard")
  })
})

// Enter Course
router.get("/course/:courseid", ensureAuthenticated ,(req, res) => {
  const courseId = req.params.courseid
  Course.findById(courseId, (err, course) => {
    if (err) {
      console.log(err)
    }
    Assignment.find({courseId}, (err, assignments) => {
      if (err) {
        console.log(err)
      }
      res.render("course", {
        course: course,
        user: req.user.name,
        usertype: req.user.usertype,
        assignments: assignments
      })
    })
  })
})

// Assignment Page
router.get("/course/:courseid/assignment/:assignmentid", (req, res) => {
  const courseId = req.params.courseid
  const assignmentId = req.params.assignmentid
  Course.findById(courseId, (err, course) => {
    if (err) {
      console.log("err1")
    }
    Assignment.find({courseId}, (err, assignments) => {
      if (err) {
        console.log("err2")
      }
      Assignment.findById(assignmentId, (err, assignment) => {
        if (err) {
          console.log("err3")
        }
        res.render("assignment", {
          course: course,
          user: req.user.name,
          usertype: req.user.usertype,
          assignments: assignments,
          targetAssignment: assignment
        })
      })
    })
  })
})

router.post("/dashboard", (req, res) => {
  const courseCode = req.body.courseCode

  // The course code has to be 24 hex characters
  if (courseCode.length < 24) {
    req.flash("error_msg", "Invalid course code")
    res.redirect("/student/dashboard")
  } else {
    CourseParticipant.find({studentId: req.user._id}, (err, participatingCourses) => {
      if (err) {
        console.log(err)
      }
      const courseIds = participatingCourses.map(participatingCourse => {
        return participatingCourse.courseId
      })
      // The course code is already enrolled
      if(courseIds.includes(courseCode)){
        req.flash("error_msg", "You are already enrolled in this course")
        res.redirect("/student/dashboard")
      } else {
        // Find course associated with the given course code
        Course.findById(courseCode, (err, course) => {
          if(err){
            console.log(err)
          }
  
          // A course was found
          if (course) {
            const newCourseParticipant = new CourseParticipant({
              courseName: course.courseName,
              courseId: course._id,
              studentId: req.user._id
            })
            newCourseParticipant.save()
            .then(newCourseParticipant => {
              req.flash("success_msg", "You are successfully enrolled")
              res.redirect("/student/dashboard")
            })
            .catch(err => console.log(err))
            // Course not found
          } else {
            req.flash("error_msg", "Course not found")
            res.redirect("/student/dashboard")
          }
        })
      }
    })
  }  
})

module.exports = router