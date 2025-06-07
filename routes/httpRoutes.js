const express = require("express");
const routes = express.Router();
const rest = require("../controllers/rest");
const authenticate = require("../utils/authenticator");

// home page
routes.get("/", (req, res) => {
  res.render("index");
});

// login and signup form
routes.get("/login", (req, res) => {
  res.render("login");
});
routes.get("/signup", (req, res) => {
  res.render("signup");
});

// dashboard
routes.get("/dashboard", authenticate(), (req, res) => {
  res.render("dashboard", { name: req.user.name, role: req.user.role });
});


// student endpoints
routes.post("/signup/student", rest.registerStudent);
routes.post("/login/student", rest.authStudent);

// parent endpoints
routes.post("/signup/parent", rest.registerParent);
routes.post("/login/parent", rest.authParent);

// teacher endpoints
routes.post("/signup/teacher", rest.registerTeacher);
routes.post("/login/teacher", rest.authTeacher);



// Logout route
routes.get('/logout', (req, res) => {

    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).send('Could not log out, please try again');
        }
        res.clearCookie('token');
        
        res.redirect('/login');
    });
});

module.exports = routes;

