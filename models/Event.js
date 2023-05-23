const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const eventSchema = new Schema({
  entryfee: Number,

  students: [
    {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
  ],
  collegeID: String,
  eventID: String,
  Hackathonname: String,
  state: String,
  winner: {
    type: Schema.Types.ObjectId,
    ref: "user",
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  expiryAt: {
    type: Date,
  },
  pool: {
    type: Number,
    default: 0,
  },
  isRestrictedToCollege: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  description: {
    type: String,
  },
});

const ModelClass = mongoose.model("event", eventSchema);
module.exports = ModelClass;
