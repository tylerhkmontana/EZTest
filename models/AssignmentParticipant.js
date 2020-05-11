const mongoose = require("mongoose")

const assignmentParticipantSchema = new mongoose.Schema({
    assignmentId: String,
    studentId: String,
    answers: {
        type: Array,
        lowercase: true
    },
    corrects: Number
})

const AssignmentParticipant = mongoose.model("AssignmentParticipant", assignmentParticipantSchema)

module.exports = AssignmentParticipant