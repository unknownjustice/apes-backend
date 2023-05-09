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
  pool: {
    type: Number,
    default: 0,
  },
});

const ModelClass = mongoose.model("event", eventSchema);

module.exports = ModelClass;