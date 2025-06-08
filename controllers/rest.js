const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const studentModel = require("../model/student");
const parentModel = require("../model/parent");
const teacherModel = require("../model/teacher");
const messageModel = require("../model/messages");

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
    return res.status(400).json({ message: "some fields are missing" });
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

    res.status(201).redirect("/login");
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
    return res.status(400).json({ message: "some fields are missing" });
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
    if (!teacherRecords)
      return res.status(500).json({ message: "Whoops! no records found!" });

    res.status(201).redirect("/login");
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Whoops! internal server Errors" });
  }
};

// auth teacher
const authTeacher = async (req, res) => {
  const role = "teacher";
  const { email, password } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ message: "some fields are missing" });
  }

  if (!["student", "parent", "teacher"].includes(role)) {
    return res.status(400).json({ message: "invalid role" });
  }

  try {
    const user = await teacherModel.findOne({ email: email, role: role });

    if (!user) {
      return res.status(401).json({ message: "invalid email" });
    }

    bcrypt.compare(password, user.password, (err, valid) => {
      if (err) {
        throw new Error(err);
      }

      if (!valid) {
        return res.status(401).json({ message: "invalid password" });
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
              return res.status(401).json({ message: "invalid password" });
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
    return res.status(500).json({ message: "server error" });
  }
};

// login student
const authStudent = async (req, res) => {
  const role = "student";
  const { studentID, password } = req.body;
  console.log(studentID);

  if (!studentID || !password || !role) {
    return res.status(400).json({ message: "some fields are missing" });
  }

  if (!["student", "parent", "teacher"].includes(role)) {
    return res.status(400).json({ message: "invalid role" });
  }

  try {
    const user = await studentModel.findOne({
      studentId: studentID,
      role: role,
    });

    if (!user) {
      return res.status(401).json({ message: "invalid student ID" });
    }

    bcrypt.compare(password, user.password, (err, valid) => {
      if (err) {
        throw new Error(err);
      }

      if (!valid) {
        return res.status(401).json({ message: "invalid password" });
      }

      if (valid) {
        jwt.sign(
          { id: user._id, name: user.studentId, role: user.role },
          process.env.ACCESS_TOKEN,
          { expiresIn: 60 * 60 * 1000 },
          (err, token) => {
            if (err) {
              throw new Error(err);
            }

            if (!token) {
              return res.status(401).json({ message: "invalid password" });
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
    return res.status(500).json({ message: "server error" });
  }
};

// login parent
const authParent = async (req, res) => {
  const role = "parent";
  const { email, password } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ message: "some fields are missing" });
  }

  if (!["student", "parent", "teacher"].includes(role)) {
    return res.status(400).json({ message: "invalid role" });
  }

  try {
    const user = await parentModel.findOne({ email: email, role: role });

    if (!user) {
      return res.status(401).json({ message: "invalid email" });
    }

    bcrypt.compare(password, user.password, (err, valid) => {
      if (err) {
        throw new Error(err);
      }

      if (!valid) {
        return res.status(401).json({ message: "invalid password" });
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
              return res.status(401).json({ message: "invalid password" });
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
    return res.status(500).json({ message: "server error" });
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
    if (!messageRec) return res.status(500).json({ message: "server error" });
    res.status(201).json(messageRec)
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "server error" });
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
};
