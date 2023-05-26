const Agenda = require("../models/Agenda");
const Users = require("../models/User");
module.exports = {
  //create agenda
  createAgenda: async (req, res) => {
    const {
      agenda,
      description,
      collegeID,
      classID,
      expiryAt,
      isRestrictedToClass,
      isRestrictedToBranch,
    } = req.body;
    const agenda_ = new Agenda({
      agenda,
      description,
      collegeID,
      expiryAt,
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
    const agenda = await Agenda.find({ _id: agendaID });
    const user = await Users.find({ rollno: rollno });
    if (user.length == 0) {
      res.status(400).json({ message: "User not found" });
    } else {
      var deductionAmount = 0;
      if (agenda[0].voters.length == 0) {
        var users = await Users.find({
          branch: agenda[0].branch,
          section: agenda[0].section,
        });
        let sumOfBalance = 0;
        users.forEach((user) => {
          sumOfBalance = sumOfBalance + user.balance;
        });
        deductionAmount = sumOfBalance * 0.3;
      } else {
        deductionAmount = 100 / agenda[0].voters.length;
      }
      deductionAmount = parseInt(deductionAmount);

      if (user[0].balance < deductionAmount) {
        res.status(400).json({ message: "Insufficient balance" });
      } else {
        //check if user has already voted

        if (agenda.length == 0) {
          res.status(400).json({ message: "Agenda not found" });
        } else {
          if (agenda[0].isRestrictedToBranch) {
            if (agenda[0].branch != user[0].branch) {
              res.status(400).json({ message: "Not from same branch" });
            }
          }

          if (agenda[0].isRestrictedToSection) {
            if (agenda[0].section != user[0].section) {
              res.status(400).json({ message: "Not from same section" });
            }
          }

          agenda[0].voters.forEach((voter) => {
            if (voter.rollno == rollno) {
              return res.status(400).json({ message: "Already voted" });
            }
          });
          let isUserAlreadyVoted = agenda[0].voters.find(
            (voter) => voter.rollno == rollno
          );

          if (!isUserAlreadyVoted) {
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
              rollno: user[0]._id,
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
    const { agendaID } = req.query;

    try {
      var agenda = await Agenda.find({ _id: agendaID });
      if (agenda.length == 0) {
        res.status(400).json({ message: "Agenda not found" });
      } else {
        var deductionAmount = 0;
        if (agenda[0].voters.length == 0) {
          var users = await Users.find({
            branch: agenda[0].branch,
            section: agenda[0].section,
          });
          let sumOfBalance = 0;
          users.forEach((user) => {
            sumOfBalance = sumOfBalance + user.balance;
          });
          deductionAmount = sumOfBalance * 0.3;
        } else {
          deductionAmount = 100 / agenda[0].voters.length;
        }
        deductionAmount = parseInt(deductionAmount);
        return res.status(200).json({
          agenda,
          deductionAmount,
        });
      }
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },
  fetchParticipents: async (req, res) => {
    const { agendaID } = req.body;
    try {
      const agenda = await Agenda.find({ _id: agendaID });
      if (agenda.length == 0) {
        res.status(400).json({ message: "Agenda not found" });
      } else {
        const users = await Users.find({ _id: { $in: agenda[0].voters } });
        res.status(200).json({
          users,
          eventDetail: agenda[0],
        });
      }
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },
};
