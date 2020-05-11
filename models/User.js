const mongoose = require("mongoose");
// Module to use findOrCreate method in mongo db
const findOrCreate = require("mongoose-findorcreate");

const userSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    lowercase: true
  },
  password: String,
  facultyid: String,
  usertype: String,
  date: {
    type: Date,
    default: Date.now,
  },
  googleId: String // only for google user
});

userSchema.plugin(findOrCreate);
const User = mongoose.model("User", userSchema);

module.exports = User;
