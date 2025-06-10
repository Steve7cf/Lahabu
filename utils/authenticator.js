const jwt = require("jsonwebtoken");

const authenticate = () => {
  return (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
      req.flash("info", ["no valid token", "warning"]);
      return res.redirect("/login");
    }

    const data = jwt.verify(token, process.env.ACCESS_TOKEN);

    req.user = data;
    console.log(data)
    next();
  };
};

module.exports = authenticate;
