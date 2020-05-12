const mongoose = require("mongoose")

const assignmentParticipantSchema = new mongoose.Schema({
    assignmentId: String,
    courseId: String,
    assignmentName: String,
    studentId: String,
    deadline: Date,
    answers: {
        type: Array,
        lowercase: true
    },  
    studentName: String,
    studentEmail: String,
    facultyId: String,
    corrects: Number,
    totalPoints: Number
})

const AssignmentParticipant = mongoose.model("AssignmentParticipant", assignmentParticipantSchema)

module.exports = AssignmentParticipant