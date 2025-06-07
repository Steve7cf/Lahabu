const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "first name is required"],
    unique: false,
  },
  lastName: {
    type: String,
    required: [true, "last name is required"],
    unique: false,
  },
  email: {
    type: String,
    required: [true, "email is required"],
    unique: false,
  },
  teacherId: {
    type: String,
    required: true,
    unique: true,
  },
  subject: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: [true, "password is required"],
    unique: false,
    minlength: [6, "weak password detected!"],
  },
  role: {
    type: String,
    required: true,
    enum: ["student", "parent", "teacher"],
    default: "teacher",
  },
});

module.exports = mongoose.model("Teacher", teacherSchema);
