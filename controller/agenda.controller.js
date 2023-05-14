const Agenda = require("../models/Agenda");
module.exports = {
  //create agenda
  createAgenda: async (req, res) => {
    const {
      agenda,
      description,
      collegeID,
      classID,
      isRestrictedToClass,
      isRestrictedToBranch,
    } = req.body;
    const agenda_ = new Agenda({
      agenda,
      description,
      collegeID,
      classID,
      isRestrictedToClass,
      isRestrictedToBranch,
    });
    try {
      const newAgenda = await agenda_.save();
      res.status(201).json(newAgenda);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },
  voteForAgenda: async (req, res) => {
    const { agendaID, rollno, isVotedYes } = req.body;
    const user = await User.find({ rollno: rollno });
    if (user.length == 0) {
      res.status(400).json({ message: "User not found" });
    } else {
      if (user[0].balance < 100) {
        res.status(400).json({ message: "Insufficient balance" });
      } else {
        //check if user has already voted
        const agenda = await Agenda.find({ agendaID: agendaID });

        if (agenda.length == 0) {
          res.status(400).json({ message: "Agenda not found" });
        } else {
          //check for if isRestrictedToCollege is true
          if (agenda[0].isRestrictedToCollege) {
            if (agenda[0].collegeID != user[0].collegeID) {
              res.status(400).json({ message: "Not from same college" });
            }
          }
          //check for if isRestrictedToClass is true
          if (agenda[0].isRestrictedToClass) {
            if (agenda[0].classID != user[0].classID) {
              res.status(400).json({ message: "Not from same class" });
            }
          }
          agenda[0].voters.forEach((voter) => {
            if (voter.rollno == rollno) {
              return res.status(400).json({ message: "Already voted" });
            }
          });
          const agenda_ = await Agenda.find({
            agendaID: agendaID,
            "voters.rollno": rollno,
          });
          if (agenda_.length == 0) {
            const deductionAmount = 100 / agenda[0].voters.length;
            user[0].balance = user[0].balance - deductionAmount;
            user[0].save();

            if (isVotedYes) {
              agenda[0].inFavourBalance =
                agenda[0].inFavourBalance + deductionAmount;
            } else {
              agenda[0].notInFavourBalance =
                agenda[0].notInFavourBalance + deductionAmount;
            }

            const newVoter = {
              rollno: user[0].rollno,
              isVotedYes: isVotedYes,
            };
            agenda[0].finalResult =
              agenda[0].inFavourBalance > agenda[0].notInFavourBalance
                ? true
                : false;
            agenda[0].voters.push(newVoter);
            agenda[0].save();
            res.status(200).json({ message: "Voted successfully" });
          }
        }
      }
    }
  },
  fetchAllAgendas: async (req, res) => {
    try {
      const agendas = await Agenda.find();
      res.status(200).json(agendas);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },
  fetchAgenda: async (req, res) => {
    const { agendaID } = req.body;
    try {
      const agenda = await Agenda.find({ agendaID: agendaID });
      if (agenda.length == 0) {
        res.status(400).json({ message: "Agenda not found" });
      } else {
        res.status(200).json(agenda);
      }
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },
};
