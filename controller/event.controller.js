//write controller for event

const { POOL_DEDUCTION } = require("../config");
const Event = require("../models/Event");
const User = require("../models/User");

module.exports = {
  // create event
  createEvent: async (req, res) => {
    const { entryfee, students, hackathonID, Hackathonname, state, winner } =
      req.body;
    const event = new Event({
      entryfee,
      students,
      hackathonID,
      Hackathonname,
      state,
      winner,
    });
    try {
      const newEvent = await event.save();
      res.status(201).json(newEvent);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },
  fetchAllEvents: async (req, res) => {
    try {
      const events = await Event.find();
      res.status(200).json(events);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },
  fetchParticipents: async (req, res) => {
    const { eventID } = req.body;
    try {
      const event = await Event.find({ eventID: eventID });
      if (event.length == 0) {
        res.status(400).json({ message: "Event not found" });
      } else {
        const users = await User.find({ _id: { $in: event[0].students } });
        res.status(200).json(users);
      }
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },
  isParticipent: async (req, res) => {
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
          if (event[0].students.includes(user[0]._id)) {
            res.status(200).json({ participated: true });
          } else {
            res.status(200).json({ participated: false });
          }
        }
      }
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },
  getEventDetailByEventID: async (req, res) => {
    try {
      const event = await Event.find({ eventID: req.query.eventID });
      if (event.length == 0) {
        res.status(400).json({ message: "Event not found" });
      } else {
        res.status(200).json(event[0]);
      }
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },
  decideWinner: async (req, res) => {
    const { eventID, winner } = req.body;
    try {
      const event = await Event.find({ eventID: eventID });
      //check if event is active or not
      if (!event[0].isActive) {
        return res.status(400).json({ message: "Event is not active" });
      }
      if (event.length == 0) {
        res.status(400).json({ message: "Event not found" });
      } else {
        const user = await User.find({ rollno: winner });
        if (user.length == 0) {
          res.status(400).json({ message: "User not found" });
        } else {
          if (event[0].winner != null) {
            res.status(400).json({ message: "Winner already decided" });
          } else {
            //check if winner is participent
            if (event[0].students.includes(user[0]._id)) {
              event[0].winner = user[0]._id;
              event[0].isActive = false;
              user[0].balance += event[0].pool * POOL_DEDUCTION;
              event[0].pool = event[0].pool * (1 - POOL_DEDUCTION);
              await event[0].save();
              await user[0].save();
              res.status(200).json({ message: "Winner decided" });
            } else {
              res.status(400).json({ message: "Winner is not participent" });
            }
          }
        }
      }
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },
};
