const express = require("express");
const routes = express.Router();
const rest = require("../controllers/rest");
const authenticate = require("../utils/authenticator");
const messages = require("../model/messages");
const gradeModel = require("../model/grade");
const subjectModel = require("../model/subjects")
const studentModel = require("../model/student")
const authTeacher = require("../utils/authTeacher")

// home page
routes.get("/", (req, res) => {
  res.render("index",  {feedback:req.flash('info')});
});

// login and signup form
routes.get("/login", (req, res) => {
  res.render("login", {feedback:req.flash('info')});
});
routes.get("/signup", (req, res) => {
  res.render("signup",  {feedback:req.flash('info')});
});

// dashboard
routes.get("/dashboard", authenticate(), async (req, res) => {
  try {
    const grades = await gradeModel.find({ studentId: req.user.name });
    const subjectData = await subjectModel.find()
    const students = await studentModel.find()

    if (!grades || grades.length === 0) {
      return res.render("dashboard", {
        name: req.user.name,
        role: req.user.role,
        subjects:subjectData,
        students:students,
        feedback:req.flash('info'),
        grades: [], // Pass empty array if no grades found
      });
    }
    res.render("dashboard", {
      name: req.user.name,
      role: req.user.role,
      subjects:subjectData,
      students:students,
      grades: grades,
      feedback:req.flash('info') // Pass array of grades
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "internal server error" });
  }
});

// class management
routes.get("/class-management", authenticate(), (req, res) => {
  res.render("classManagement", { name: req.user.name, role: req.user.role, feedback:req.flash('info') });
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

routes.post("/student/grade",authTeacher("teacher"), rest.addGrade);

// Logout route
routes.get("/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).json({ message: 'Logout failed' });
    }
    
    res.clearCookie('token');
    res.clearCookie('connect.sid'); // The default session cookie name
    
    return res.redirect('/login');
  });
});

// messages
routes.post("/chats", rest.chats);

routes.post("/subject/add", authTeacher("teacher"), async(req, res) => {
  const{subject, subjectTeacher} = req.body

  try {
    const addedSubject = await subjectModel.create({subject:subject, subjectTeacher:subjectTeacher})
    if(!addedSubject) return res.status(500).json({message:"internal server error"})
    res.json(addedSubject)
  } catch (error) {
    
  }
})

module.exports = routes;
