require("dotenv").config()
module.exports = {
    mongoURI: `mongodb+srv://tylerhkmontana:${process.env.DB_PASSWORD}@hktmdatabase-xh5zl.mongodb.net/userAuthDB`
}