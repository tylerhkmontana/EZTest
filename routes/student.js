const express = require("express");
const router = express.Router();
const Course = require("../models/Course")
const CourseParticipant = require("../models/CourseParticipant")
const Assignment = require("../models/Assignment")
const AssignmentParticipant = require("../models/AssignmentParticipant")
const { ensureAuthenticated } = require("../config/auth");

// login as a student
router.get("/dashboard", ensureAuthenticated, (req, res) =>
  // Find the courseParticipant informations associated with the user_id
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

      const openAssignments = []
      assignments.forEach(a => {
        if (a.status === "open"){
          openAssignments.push(a)
        }
      })

      AssignmentParticipant.find({ studentId: req.user._id }, (err, result) => {
        if (err) {
          console.log(err)
        }

        const currentTime = new Date()
        const submittedAssignmentIds = result.map(r => r.assignmentId)
        const classOverviews = openAssignments.map(oa => {
          if (submittedAssignmentIds.includes(`${oa._id}`)) {
            return {
              assignmentName: oa.assignmentName,
              daysLeft: oa.deadline - currentTime,
              isSubmitted: true
            }
          } else {
            return {
              assignmentName: oa.assignmentName,
              daysLeft: oa.deadline - currentTime,
              isSubmitted: false
            }
          }
        })

        res.render("course", {
          course: course,
          user: req.user.name,
          usertype: req.user.usertype,
          assignments: assignments,
          classOverviews: classOverviews
        })
      })
    })
  })
})

// Current Assignment Page
router.get("/course/:courseid/assignment/:assignmentid", ensureAuthenticated ,(req, res) => {
  const courseId = req.params.courseid
  const assignmentId = req.params.assignmentid
  Course.findById(courseId, (err, course) => {
    if (err) {
      console.log(err)
    }
    Assignment.find({courseId}, (err, assignments) => { // for the menu
      if (err) {
        console.log(err)
      }
      AssignmentParticipant.findOne({ studentId: req.user._id, assignmentId: assignmentId }, (err, participant) => {
        if (err) {
          console.log(err)
        }

        // Check if the student has submitted the target assignment already
        if (participant) {
          Assignment.findById(assignmentId, (err, assignment) => { // for the current page
            if (err) {
              console.log(err)
            }

            res.render("assignment", {
              course: course,
              user: req.user.name,
              usertype: req.user.usertype,
              assignments: assignments,
              targetAssignment: assignment,
              submitted: true
            })
          })
        } else {
          Assignment.findById(assignmentId, (err, assignment) => { // for the current page
            if (err) {
              console.log(err)
            }
          
            res.render("assignment", {
              course: course,
              user: req.user.name,
              usertype: req.user.usertype,
              assignments: assignments,
              targetAssignment: assignment,
              submitted: false
            })
          })
        }
      })
    })
  })
})

// Past Assignment Page
router.get("/course/:courseid/pastassignment/:assignmentid", ensureAuthenticated ,(req, res) => {
  const courseId = req.params.courseid
  const assignmentId = req.params.assignmentid
  Course.findById(courseId, (err, course) => {
    if (err) {
      console.log(err)
    }
    Assignment.find({courseId}, (err, assignmentList) => { // for the menu
      if (err) {
        console.log(err)
      }
      AssignmentParticipant.findOne({ studentId: req.user._id, assignmentId: assignmentId }, (err, participant) => {
        if (err) {
          console.log(err)
        }

        if (participant) {
          Assignment.findById(assignmentId, (err, assignment) => { // for the current page
            if (err) {
              console.log(err)
            }

            res.render("pastassignment", {
              course: course,
              user: req.user.name,
              usertype: req.user.usertype,
              assignments: assignmentList,
              targetAssignment: assignment,
              submitted: true,
              studentAnswers: participant.answers
            })
          })
        } else {
          Assignment.findById(assignmentId, (err, assignment) => { // for the current page
            if (err) {
              console.log(err)
            }
          
            res.render("pastassignment", {
              course: course,
              user: req.user.name,
              usertype: req.user.usertype,
              assignments: assignmentList,
              targetAssignment: assignment,
              submitted: false,
              studentAnswers: []
            })
          })
        }
      })
    })
  })
})

// Grade Page
router.get("/course/:courseid/grade", ensureAuthenticated, (req, res) => {
  const studentId = req.user._id
  const courseId = req.params.courseid

  Course.findById(courseId, (err, course) => {
    if (err) {
      console.log(err)
    }
    Assignment.find({courseId}, (err, assignments) => {
      if (err) {
        console.log(err)
      }
      
      // Get submitted assignments
      AssignmentParticipant.find({ studentId: req.user._id }, (err, data) => {
        if (err) {
          console.log(err)
        }

    
        const gradedAssignments = data.map(d => {
          // The student has submitted the assignment
            return {
              assignmentName: d.assignmentName,
              totalPoints: d.totalPoints,
              corrects: d.corrects,
              deadline: d.deadline,
            }
        })

        // Find total grades
        let accumulativePoints = 0
        let accumulativeCorrects = 0
        gradedAssignments.forEach(g => {
          accumulativePoints += g.totalPoints
          accumulativeCorrects += g.corrects
        })

        res.render("grade", {
          course: course,
          user: req.user.name,
          usertype: req.user.usertype,
          assignments: assignments,
          gradedAssignments: gradedAssignments,
          accumulativeCorrects: accumulativeCorrects,
          accumulativePoints: accumulativePoints
        })
      })   
    })
  })
})

// Enroll Course
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
              studentId: req.user._id,
              studentName: req.user.name,
              studentEmail: req.user.email,
              facultyId: req.user.facultyid
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

// Submit Assignment
router.post("/course/:courseid/assignment/:assignmentid/submitAssignment", (req, res) => {
  const courseId = req.params.courseid
  const assignmentId = req.params.assignmentid
  const studentId = req.user._id
  const studentAnswers = Object.values(req.body).map(a => {
    return a.toLowerCase() // make student answers case insensitive
  })
  let correctCount = 0

  // Find the assginment with the given assignmentid
  Assignment.findById(assignmentId, (err, assignment) => {
    if (err) {
      console.log(err)
    }
    let correctAnswers = []
    assignment.questions.forEach(q => {
      correctAnswers.push(q.answer)
    })

    correctAnswers.forEach((ans, index) => {
      if(ans == studentAnswers[index]){
        correctCount++
      }
    })

    AssignmentParticipant.findOne({ studentId: studentId, assignmentId: assignmentId }, (err, student) => {
      if (err) {
        console.log(err)
      }
      const currentTime = new Date()
      // Check if a student has already submitted this assignment or not
      if (student) {
        req.flash("error_msg", "You've already submitted this assignment/test")
        res.redirect(`/student/course/${courseId}/assignment/${assignmentId}`)
      } else if (currentTime > assignment.deadline) {
        req.flash("error_msg", "You cannot submit an assignment that passed the due date")
        res.redirect(`/student/course/${courseId}/assignment/${assignmentId}`)
      } else {
        const newParticipant = AssignmentParticipant({
          assignmentId: assignmentId,
          courseId: courseId,
          assignmentName: assignment.assignmentName,
          deadline: assignment.deadline,
          studentId: studentId,
          answers: studentAnswers,
          studentName: req.user.name,
          studentEmail: req.user.email,
          facultyId: req.user.facultyid,
          corrects: correctCount,
          totalPoints: assignment.totalPoints
        })
        newParticipant.save()
         .then(result => {
           req.flash("success_msg", "You successfully submitted your assignment")
           res.redirect(`/student/course/${courseId}`)
         })
         .catch(err => console.log(err))
      }
    })
  })
})


module.exports = router