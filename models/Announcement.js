const mongoose = require("mongoose")

const announcementSchema = new mongoose.Schema({
    title: String,
    announcement: String,
    courseId: String,
    dateAdded: {
        type: Date,
        default: Date.now,
    }
})

const Announcement = mongoose.model("Announcement", announcementSchema)

module.exports = Announcement