const express = require("express");
const router = express.Router();
const Course = require("../models/Course")
const CourseParticipant = require("../models/CourseParticipant")
const Assignment = require("../models/Assignment")
const { ensureAuthenticated } = require("../config/auth");

// login as an instructor
router.get("/dashboard", ensureAuthenticated, (req, res) => {
  Course.find({ instructorId: req.user._id }, (err, course) => {
    if (err) {
      console.log(err)
    }

    res.render("dashboard", {
      user: req.user.name, usertype: req.user.usertype,
      courses: course
    })
  })
  
});

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

// Create a New Assignment
router.get("/course/:courseid/newAssignment", ensureAuthenticated ,(req, res) => {
  const courseId = req.params.courseid
  Course.findById(courseId, (err, course) => {
    if (err) {
      console.log(err)
    }
    Assignment.find({courseId}, (err, assignments) => {
      if (err) {
        console.log(err)
      }
      res.render("newassignment", {
        course: course,
        user: req.user.name,
        usertype: req.user.usertype,
        assignments: assignments
      })
    })
  })
})

// Assignment Page
router.get("/course/:courseid/assignment/:assignmentid", ensureAuthenticated ,(req, res) => {
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

router.get("/course/:courseid/editAssignment/:assignmentid", ensureAuthenticated ,(req, res) => {
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
        res.render("editassignment", {
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

// Handle delete course
router.post("/course/:courseid", (req, res) => {
  const courseId = req.params.courseid
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

// Add New Assignment
router.post("/course/:courseid/newAssignment", (req, res) => {
  const assignmentName = req.body.assignmentName
  const deadline = new Date(`${req.body.deadline}T00:00`)
  const data = req.body
  const courseId = req.params.courseid

  delete data["deadline"]
  delete data["assignmentName"]

  // Extract Questions from Assignmnet Information
  let tempData = Object.values(data)
  const questions = tempData.map((e, index) => {
    if (e.length < 3){
      let q = {
        questionNumber: index + 1,
        questionType: "shortAnswer",
        instruction: e[0],
        answer: e[1].toLowerCase()
      }
      return q
    } else {
      let q = {
        questionNumber: index + 1,
        questionType: "multipleChoice",
        instruction: e[0],
        choiceA: e[1],
        choiceB: e[2],
        choiceC: e[3],
        choiceD: e[4],
        choiceE: e[5],
        answer: e[6]
      }
      return q
    }
  })

  // total number of questinos
  const totalPoints = questions.length

  if (questions.length > 0){
    // new assignment object to be stored
    const newAssignment = Assignment({
      assignmentName,
      deadline,
      questions: questions,
      totalPoints,
      courseId
    })

    newAssignment.save()
    .then(assignment => {
      req.flash("success_msg", "The assignment has been successfully created")
      res.redirect(`/instructor/course/${courseId}/newAssignment`)
    })
    .catch(err => console.log(err))
  } else {
    req.flash("error_msg", "The assignment must have at least one question")
    res.redirect(`/instructor/course/${courseId}/newAssignment`)
  }
})

// Delete Assginment
router.post("/course/:courseid/deleteAssignment/:assignmentid", (req, res) => {
  const assignmentId = req.params.assignmentid
  const courseId = req.params.courseid
  Assignment.deleteOne({ _id: assignmentId }, (err, result) => {
    if (err) {
      console.log(err)
    }
    req.flash("success_msg", "The assignment has been successfully deleted")
    res.redirect(`/instructor/course/${courseId}`)
  })
})

// Edit Assignment
router.post("/course/:courseid/editAssignment/:assignmentid", (req, res) => {
  const assignmentName = req.body.assignmentName
  const deadline = new Date(`${req.body.deadline}T00:00`)
  const data = req.body
  const courseId = req.params.courseid
  const assignmentId = req.params.assignmentid

  delete data["deadline"]
  delete data["assignmentName"]

  // Extract Questions from Assignmnet Information
  let tempData = Object.values(data)
  const questions = tempData.map((e, index) => {
    if (e.length < 3){
      let q = {
        questionNumber: index + 1,
        questionType: "shortAnswer",
        instruction: e[0],
        answer: e[1].toLowerCase()
      }
      return q
    } else {
      let q = {
        questionNumber: index + 1,
        questionType: "multipleChoice",
        instruction: e[0],
        choiceA: e[1],
        choiceB: e[2],
        choiceC: e[3],
        choiceD: e[4],
        choiceE: e[5],
        answer: e[6]
      }
      return q
    }
  })

  // total number of questinos
  const totalPoints = questions.length

  console.log(deadline)
  Assignment.findOneAndUpdate({_id: assignmentId}, {
    assignmentName,
    deadline,
    questions,
  }, (err, result) => {
    if (err) {
      console.log(err)
    }
    req.flash("success_msg", "The assignment has been successfully edited")
    res.redirect(`/instructor/course/${courseId}`)
  })
  
})

module.exports = router