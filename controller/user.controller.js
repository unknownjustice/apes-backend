/*write controller for user */
const User = require("../models/User");
const Event = require("../models/Event");
//const Hackathon = require("../models/Hackathon");
const jwt = require("jwt-simple");
const config = require("../config");
const bcrypt = require("bcrypt-nodejs");
const nodemailer = require("nodemailer");

function tokenForUser(user) {
  const timestamp = new Date().getTime();
  return jwt.encode(
    { sub: user.rollno, iat: timestamp },
    "BHOLEBABADEDENOTECHAPPANKIMACHINE"
  );
}
const userController = {
  //get all users
  getAllUsers: async (req, res) => {
    try {
      const users = await User.find();
      res.json(users);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
  //get one user
  getUserById: async (req, res) => {
    let rollno = req.query.rollno;
    try {
      const user = await User.find({ rollno: rollno });
      res.json(user[0]);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
  //add user
  addUser: async (req, res) => {
    const {
      rollno,
      name,
      collegeID,
      phoneno,
      email,
      attendance,
      marks,
      classperformance,
      password,
      balance,
    } = req.body;
    const user = new User({
      rollno,
      name,
      collegeID,
      phoneno,
      email,
      attendance,
      marks,
      classperformance,
      password,
      balance,
    });
    try {
      const newUser = await user.save();
      res.status(201).json(newUser);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },
  // participate in event
  participateEvent: async (req, res) => {
    const { rollno, eventID } = req.body;
    try {
      const event = await Event.find({ _id: eventID });
      if (event.length == 0) {
        res.status(400).json({ message: "Event not found" });
      } else {
        const user = await User.find({ rollno: rollno });
        //check for if isRestrictedToCollege is true
        if (event[0].isRestrictedToCollege) {
          if (user[0].collegeID != event[0].collegeID) {
            res.status(400).json({ message: "Not from same college" });
          }
        }
        if (user.length == 0) {
          res.status(400).json({ message: "User not found" });
        } else {
          if (user[0].balance < event[0].entryFee) {
            res.status(400).json({ message: "Insufficient Balance" });
          } else {
            //console.log(event[0], user[0]);
            if (event[0].students.includes(user[0]._id)) {
              res.status(400).json({ message: "Already Participated" });
            } else {
              await User.updateOne(
                { rollno: rollno },
                { $inc: { balance: -event[0].entryfee } }
              );
              //addtopool prize
              await Event.updateOne(
                { _id: eventID },
                {
                  $push: { students: user[0]._id },
                  $inc: { pool: event[0].entryfee },
                }
              );

              res.status(201).json({ message: "Participated" });
            }
          }
        }
      }
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },
  distributeBalance: async (req, res) => {
    //distribution logic
    //distribute balance based on attendance, marks, classperformance
    const users = await User.find();
    users.forEach(async (user) => {
      const updatedUser = await User.updateOne(
        { rollno: user.rollno },
        {
          $inc: {
            balance:
              (user.attendance * 0.1 +
                user.marks * 0.3 +
                user.classperformance * 0.6) *
              10,
          },
        }
      );
    });
    res.status(201).json({ message: "Balance Distributed" });
  },
  //login by rollno and password
  login: async (req, res) => {
    const { rollno, password } = req.body;
    try {
      const user = await User.find({ rollno: rollno });
      console.log(user, rollno);
      if (user.length == 0) {
        res.status(400).json({ message: "User not found" });
      } else {
        bcrypt.compare(password, user[0].password, function (err, result) {
          if (result) {
            res
              .status(200)
              .json({ token: tokenForUser(user[0]), user: user[0] });
          } else {
            res.status(400).json({ message: "Incorrect password" });
          }
        });
      }
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },
  //forget password
  resetPassword: async (req, res) => {
    const { rollno } = req.body;
    const user = await User.find({ rollno: rollno });
    const otp = config.generateOTP();
    await config.sendOTPtoEmail(user[0].email, otp);
    console.log(otp, user[0].email, rollno);

    user[0].otp = otp;
    await user[0].save();
    res.status(200).json({ message: "OTP sent to email" });
  },
  verifyOtp: async (req, res) => {
    const { rollno, otp, password } = req.body;
    const user = await User.find({ rollno: rollno });
    if (user[0].otp == otp) {
      user[0].password = password;
      await user[0].save();
      res.status(200).json({ message: "OTP verified" });
    } else {
      res.status(400).json({ message: "Incorrect OTP" });
    }
  },
  changePassword: async (req, res) => {
    const { rollno, oldPassword, newPassword } = req.body;
    const user = await User.find({ rollno: rollno });
    bcrypt.compare(oldPassword, user[0].password, async function (err, result) {
      if (result) {
        user[0].password = newPassword;
        await user[0].save();
        res.status(200).json({ message: "Password changed" });
      } else {
        res.status(400).json({ message: "Incorrect password" });
      }
    });
  },
};
module.exports = userController;
