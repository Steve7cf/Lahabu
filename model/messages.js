const mongoose = require("mongoose");

const messageSchema =  new mongoose.Schema({
  sender: {
    type: String,
    required: [true, "sender ID is required"],
    lowercase:true
  },
  receiver: {
    type: String,
    required: [true, "receiver Id is required"],
    unique: false,
  },
  message: {
    type: String,
  },
  time: {
    type: String,
    required: [true, "time is required"],
    default:Date.now()
  }
}, {timestamps:true});

module.exports = mongoose.model("Messages", messageSchema);
