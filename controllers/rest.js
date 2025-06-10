const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const studentModel = require("../model/student");
const parentModel = require("../model/parent");
const teacherModel = require("../model/teacher");
const messageModel = require("../model/messages");
const gradeModel = require("../model/grade");

// register student
const registerStudent = async (req, res) => {
  const {
    firstName,
    lastName,
    dateOfBirth,
    password,
    confirmPassword,
    grade,
    parentEmail,
    studentId,
  } = req.body;
  if (
    !firstName ||
    !lastName ||
    !dateOfBirth ||
    !password ||
    !confirmPassword ||
    !grade ||
    !parentEmail ||
    !studentId
  ) {
    req.flash("error", "All fields are required");
    return res.status(401).redirect("/signup");
  }

  if (password !== confirmPassword) {
    req.flash("error", "Passwords do not match");
    return res.redirect("/register/student");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  try {
    const studentObj = {
      firstName: firstName,
      lastName: lastName,
      studentId: studentId,
      dateOfBirth: dateOfBirth,
      password: hashedPassword,
      gradeLevel: grade,
      parentEmail: parentEmail,
    };

    // create student records
    const studentRecords = await studentModel.create(studentObj);
    if (!studentRecords)
      return res
        .status(500)
        .json({ message: "Whoops! cant create account right now" });

    req.flash("success", "Registration successful! Please login");
    res.redirect("/login");
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Whoops! internal server Errors" });
  }
};

// register parent
const registerParent = async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    password,
    confirmPassword,
    phone,
    childStudentId,
  } = req.body;
  if (
    !firstName ||
    !lastName ||
    !email ||
    !password ||
    !confirmPassword ||
    !phone ||
    !childStudentId
  ) {
    return res.status(400).json({ message: "some fields are missing" });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  try {
    const parentObj = {
      firstName: firstName,
      lastName: lastName,
      studentId: childStudentId,
      phone: phone,
      email: email,
      password: hashedPassword,
    };

    // create parent records
    const parentRecords = await parentModel.create(parentObj);
    if (!parentRecords)
      return res
        .status(500)
        .json({ message: "Whoops! cant create account right now" });

    res.status(201).redirect("/login");
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Whoops! internal server Errors" });
  }
};

// register teacher
const registerTeacher = async (req, res) => {
  const role = "teacher";
  const {
    firstName,
    lastName,
    email,
    password,
    confirmPassword,
    subject,
    teacherId,
  } = req.body;

  console.log(
    firstName,
    lastName,
    email,
    password,
    confirmPassword,
    subject,
    teacherId
  );
  if (
    !firstName ||
    !lastName ||
    !email ||
    !password ||
    !confirmPassword ||
    !subject ||
    !teacherId ||
    !role
  ) {
    req.flash("info", ["some fields are missing", "warning"]);
    return res.redirect("/login");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  try {
    const teacherObj = {
      firstName: firstName,
      lastName: lastName,
      email: email,
      subject: subject,
      email: email,
      password: hashedPassword,
      teacherId: teacherId,
      role: role,
    };

    const teacherRecords = await teacherModel.create(teacherObj);
    if (!teacherRecords) {
      req.flash("info", ["No taecher records found", "warning"]);
      return res.redirect("/login");
    }

    res.status(201).redirect("/login");
  } catch (error) {
    console.log(error.message);
    req.flash("info", ["Whoops! internal!", "danger"]);
    return res.redirect("/login");
  }
};

// auth teacher
const authTeacher = async (req, res) => {
  const role = "teacher";
  const { email, password } = req.body;

  if (!email || !password || !role) {
    req.flash("info", ["some fields are missing", "warning"]);
    return res.redirect("/login");
  }

  try {
    const user = await teacherModel.findOne({ email: email, role: role });

    if (!user) {
      req.flash("info", ["wrong credentials", "warning"]);
      return res.redirect("/login");
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      req.flash("info", ["wrong password", "warning"]);
      return res.redirect("/login");
    }

    req.session.user = {
      id: user._id,
      name: user.firstName,
      role: user.role,
      email: user.email,
    };

    const token = jwt.sign(
      { id: user._id, name: user.firstName, role: user.role },
      process.env.ACCESS_TOKEN,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3600000, // 1 hour
    });

    return res.status(200).redirect("/dashboard");
  } catch (error) {
    console.error(error.message);
    req.flash("info", ["internal server error", "warning"]);
    return res.redirect("/login");
  }
};

// login student
const authStudent = async (req, res) => {
  const role = "student";
  const { studentID, password } = req.body;

  if (!studentID || !password || !role) {
    req.flash("info", ["some fields are missing", "warning"]);
    return res.redirect("/login");
  }

  try {
    const user = await studentModel.findOne({
      studentId: studentID,
      role: role,
    });

    if (!user) {
      req.flash("info", ["invalid student Id", "warning"]);
      return res.redirect("/login");
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      req.flash("info", ["invalid password", "warning"]);
      return res.status(401).redirect("/login");
    }

    // Store user in session
    req.session.user = {
      id: user._id,
      studentId: user.studentId,
      role: user.role,
      name: `${user.firstName} ${user.lastName}`,
    };

    const token = jwt.sign(
      { id: user._id, name: user.studentId, role: user.role },
      process.env.ACCESS_TOKEN,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3600000,
    });

    return res.status(200).redirect("/dashboard");
  } catch (error) {
    console.error(error.message);
    req.flash("info", ["whoops! internal server error", "warning"]);
    return res.redirect("/login");
  }
};

// login parent
const authParent = async (req, res) => {
  const role = "parent";
  const { email, password } = req.body;

  if (!email || !password || !role) {
    req.flash("info", ["some fields are missing", "warning"]);
    return res.redirect("/login");
  }

  if (!["student", "parent", "teacher"].includes(role)) {
    req.flash("info", ["forbidden", "warning"]);
    return res.status(403).redirect("/login");
  }

  try {
    const user = await parentModel.findOne({ email: email, role: role });

    if (!user) {
      req.flash("info", ["invalid email", "warning"]);
      return res.redirect("/login");
    }

    bcrypt.compare(password, user.password, (err, valid) => {
      if (err) {
        throw new Error(err);
      }

      if (!valid) {
        req.flash("info", ["invalid password", "warning"]);
        return res.redirect("/login");
      }

      if (valid) {
        jwt.sign(
          { id: user._id, name: user.firstName, role: user.role },
          process.env.ACCESS_TOKEN,
          { expiresIn: 60 * 60 * 1000 },
          (err, token) => {
            if (err) {
              throw new Error(err);
            }

            if (!token) {
              req.flash("info", ["invalid password", "warning"]);
              return res.redirect("/login");
            }

            if (token) {
              res.cookie("token", token);

              return res.status(200).redirect("/dashboard");
            }
          }
        );
      }
    });
  } catch (error) {
    console.log(error.message);
    req.flash("info", ["internal server error", "warning"]);
    return res.redirect("/login");
  }
};

// messages
const chats = async (req, res) => {
  const { sender, message, receiver } = req.body;
  try {
    const messageObj = {
      sender: sender,
      message: message,
      receiver: receiver,
    };
    const messageRec = await messageModel.create(messageObj);
    if (!messageRec) {
      req.flash("info", ["no messages", "warning"]);
      return res.redirect("/dashboard");
    }
    res.status(201).json(messageRec);
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "server error" });
  }
};

const addGrade = async (req, res) => {
  const { studentId, subject, grade, examType } = req.body;
  console.log(studentId, subject, grade, examType);
  if (!studentId || !subject || !grade || !examType) {
    req.flash("info", ["some fields are missing", "warning"]);
    return res.redirect("/dashboard");
  }
  try {
    const gradeObj = {
      studentId: studentId,
      subject: subject,
      grade: grade,
      examType: examType,
    };
    const gradeRecords = await gradeModel.create(gradeObj);
    if (!gradeRecords) req.flash("info", ["no Record", "warning"]);
    return res.redirect("/dashboard");
  } catch (error) {
    console.log(error.message);
    req.flash("info", ["internal server error", "warning"]);
    return res.redirect("/logout");
  }
};

module.exports = {
  authStudent,
  registerStudent,
  registerParent,
  registerTeacher,
  authParent,
  authTeacher,
  chats,
  addGrade,
};
