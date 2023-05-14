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

  isRestrictedToClass: {
    type: Boolean,
    default: false,
  },
  isRestrictedToBranch: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  inFavourBalance: {
    type: Number,
  },
  notInFavourBalance: {
    type: Number,
  },
  finalResult: {
    type: Boolean,
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

// Middleware function to update weightage value for each voter
agendaSchema.pre("save", async function (next) {
  const agenda = this;
  const voterRollnos = agenda.voters.map((voter) => voter.rollno);
  const users = await mongoose
    .model("user")
    .find({ rollno: { $in: voterRollnos } })
    .exec();
  agenda.voters.forEach((voter) => {
    const user = users.find((u) => u.rollno.equals(voter.rollno));
    const attendance = user.attendance;
    const classPerformance = user.classPerformance;
    const weightage = computeWeightage(attendance, classPerformance);
    voter.weightage = weightage;
  });
  next();
});

const ModelClass = mongoose.model("agenda", agendaSchema);
module.exports = ModelClass;
