const mongoose = require("mongoose")

const courseSchema = new mongoose.Schema({
    courseName: String,
    section: String,
    semester: String,
    instructorName: String,
    instructorId: String
})

const Course = mongoose.model("Course", courseSchema)

module.exports = Course