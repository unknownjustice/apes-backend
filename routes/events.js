var express = require("express");
var router = express.Router();
var eventController = require("../controller/event.controller");
var userController = require("../controller/user.controller");

router.get("/getallEvents", eventController.fetchAllEvents); //get all events
router.post("/createEvent", eventController.createEvent); //create event
router.post("/getParticipents", eventController.fetchParticipents); //get participents of an event
router.post("/isParticipent", eventController.isParticipent); //check if user is participent of an event
router.get("/getEventById", eventController.getEventDetailByEventID); //get event by id
router.post("/decideWinner", eventController.decideWinner); //decide winner of an event
module.exports = router;
