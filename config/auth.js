module.exports = {
  ensureAuthenticated: function (req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash("error_msg", "Please log in to view this resource");
    res.redirect("/users/login");
  },
  forwardAuthenticated: function (req, res, next) {
    if (!req.isAuthenticated()) {
      return next();
    }
    const usertype = req.user.usertype
    if(usertype === "Student"){
      res.redirect("student/dashboard");
    } else {
      res.redirect("instructor/dashboard");
    }
  },
};
