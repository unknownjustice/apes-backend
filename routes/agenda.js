var express = require("express");
var router = express.Router();

var agendaController = require("../controller/agenda.controller");
var userController = require("../controller/user.controller");
router.get("/getallAgendas", agendaController.fetchAllAgendas); //get all agendas
router.post("/createAgenda", agendaController.createAgenda); //create agenda
router.post("/voteForAgenda", agendaController.voteForAgenda); //get voters of an agenda
//router.post("/isVoter", agendaController.isVoter); //check if user is voter of an agenda
router.get("/fetchAgenda", agendaController.fetchAgenda); //get agenda by id
//router.post("/decideWinner", agendaController.decideWinner); //decide winner of an agenda
router.post("/getParticipents", agendaController.fetchParticipents);
module.exports = router;
