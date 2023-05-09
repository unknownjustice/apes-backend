/*write controller for user */
const User = require("../models/User");
const Event = require("../models/Event");
//const Hackathon = require("../models/Hackathon");
const jwt = require("jwt-simple");
const config = require("../config");
const bcrypt = require("bcrypt-nodejs");

function tokenForUser(user) {
  const timestamp = new Date().getTime();
  return jwt.encode({ sub: user.rollno, iat: timestamp }, config.secret);
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
      const event = await Event.find({ eventID: eventID });
      if (event.length == 0) {
        res.status(400).json({ message: "Event not found" });
      } else {
        const user = await User.find({ rollno: rollno });
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
                { eventID: eventID },
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
};
module.exports = userController;
