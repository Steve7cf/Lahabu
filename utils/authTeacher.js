const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.session.user || req.session.user.role !== role) {
      req.flash("info", ["no valid token", "warning"]);
      return res.status(403).redirect("/login");
    }
    next();
  };
};

module.exports = requireRole