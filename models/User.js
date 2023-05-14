const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt-nodejs");

const userSchema = new Schema({
  rollno: { type: String, unique: true, lowercase: true },
  name: String,
  collegeID: String,
  phoneno: String,
  email: { type: String, unique: true, lowercase: true },
  attendance: {
    type: Number,
    min: 0,
    max: 100,
  },
  marks: {
    type: Number,
    min: 0,
    max: 100,
  },
  classperformance: {
    type: Number,
    min: 2,
    max: 10,
  },
  password: String,
  balance: {
    default: 0,
    type: Number,
  },
  otp: String,
});

userSchema.pre("save", function (next) {
  const user = this;

  bcrypt.genSalt(10, function (err, salt) {
    if (err) {
      return next(err);
    }

    bcrypt.hash(user.password, salt, null, function (err, hash) {
      if (err) {
        return next(err);
      }

      user.password = hash;
      next();
    });
  });
});

const ModelClass = mongoose.model("user", userSchema);

module.exports = ModelClass;
