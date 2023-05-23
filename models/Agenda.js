const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const agendaSchema = new Schema({
  agendaID: Schema.Types.ObjectId,
  voters: [
    {
      rollno: {
        type: Schema.Types.ObjectId,
        ref: "user",
      },
      weightage: {
        type: Number,
        default: 0,
      },

      isVotedYes: {
        type: Boolean,
        default: false,
      },
    },
  ],

  collegeID: String,
  classID: String,
  agenda: String,
  description: String,

  isRestrictedToSection: {
    type: Boolean,
    default: false,
  },
  expiryAt: {
    type: Date,
  },
  isRestrictedToBranch: {
    type: Boolean,
    default: false,
  },
  isRestrictedToCollege: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  inFavourBalance: {
    type: Number,
    default: 0,
  },
  notInFavourBalance: {
    type: Number,
    default: 0,
  },
  finalResult: {
    type: Boolean,
  },
  branch: {
    type: String,
    default: "CSE",
  },
  section: {
    type: String,
    default: "A",
  },
});

// Function to compute weighted average
function computeWeightage(attendance, classPerformance) {
  const attendanceWeight = 0.4;
  const classPerformanceWeight = 0.6;
  return (
    attendance * attendanceWeight + classPerformance * classPerformanceWeight
  );
}

const ModelClass = mongoose.model("agenda", agendaSchema);
module.exports = ModelClass;
