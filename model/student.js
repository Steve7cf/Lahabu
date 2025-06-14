const mongoose = require("mongoose");

const studentSchema =  new mongoose.Schema({
  studentId: {
    type: String,
    required: [true, "sudent ID is required"],
    unique: true,
    lowercase:true
  },
  firstName: {
    type: String,
    required: [true, "first name is required"],
    unique: false,
    lowercase:true
  },
  lastName: {
    type: String,
    required: [true, "last name is required"],
    unique: false,
    lowercase:true
  },
  gradeLevel: {
    type: String,
    required: [true, "student level/form/class is required"],
    enum: ["1", "2", "3", "4"],
  },
  dateOfBirth: {
    type: String,
    required: [true, "date of birth is required"],
    unique: false,
  },
  parentEmail: {
    type: String,
    required: [true, "parent email is required"],
    unique: false,
    lowercase:true
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
    default: "student",
    lowercase:true
  }
});

module.exports = mongoose.model("Student", studentSchema);
