const mongoose = require("mongoose")

courseParticipantSchema = new mongoose.Schema({
    courseName: String,
    courseId: String,
    studentId: String,
    studentName: String,
    studentEmail: String,
    facultyId: String
})

const courseParticipant = mongoose.model("courseParticipant", courseParticipantSchema)

module.exports = courseParticipant