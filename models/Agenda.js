const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const agendaSchema = new Schema({
  agendaID: String,
  voters: [
    {
      rollno: Schema.Types.ObjectId,
      ref: "user",
      weightage: Number,
    },
  ],
  collegeID: String,
  classID: String,
  agenda: String,
  description: String,
  isRestrictedToClass: {
    type: Boolean,
    default: false,
  },
  isRestrictedToBranch: {
    type: Boolean,
    default: false,
  },
});
const ModelClass = mongoose.model("agenda", agendaSchema);
module.exports = ModelClass;
