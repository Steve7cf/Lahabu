const jwt = require("jsonwebtoken");

const authenticate = () => {
  return (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "No  valid token found!" });
    }

    const data = jwt.verify(token, process.env.ACCESS_TOKEN);

    req.user = data;
    console.log(data)
    next();
  };
};

module.exports = authenticate;
