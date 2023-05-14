var express = require("express");
var router = express.Router();
var User = require("../models/User");
var Event = require("../models/Event");
var userController = require("../controller/user.controller");
//var eventController = require("../controllers/event.controller");

router.get("/getallusers", userController.getAllUsers);
router.get("/getuserbyid/:id", userController.getUserById);
router.post("/adduser", userController.addUser);
router.get("/distributeBalance", userController.distributeBalance);
router.post("/participateEvent", userController.participateEvent);
router.post("/resetPassword", userController.resetPassword);
router.post("/login", userController.login);
router.post("/verifyOTP", userController.verifyOtp);
router.post("/changePassword", userController.changePassword);
module.exports = router;
