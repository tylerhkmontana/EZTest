const mongoose = require("mongoose")

const assignmentSchema = new mongoose.Schema({
    assignmentName: String,
    deadline: Date,
    questions: Object,
    totalPoints: Number,
    courseId: String,
    status: {
        type: String,
        default: "open"
    }
})

const Assignment = mongoose.model("Assignment", assignmentSchema)

module.exports = Assignment