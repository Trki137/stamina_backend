const express = require("express");
const router = express.Router();
const Event = require("../models/EventModel");
const User = require("../models/UserModel");
router.post("/", (req,res,next) => {
  (async () => {
    const {userId, eventId} = req.body;

    let result = await checkUserAndEvent(userId,eventId,res);

    if(!result) return;

    result = await Event.joinEvent(userId,eventId);

    if(!result){
      res.status(500);
      res.send("Something went wrong. Try again later");
      return;
    }

    res.send(result);
  })()
});


router.delete("", (req,res,next) => {
  (async () => {
    const {userId, eventId} = req.body;

    let result = await checkUserAndEvent(userId,eventId,res);

    if(!result) return;

    result = await Event.unJoinEvent();

    if(!result){
      res.status(500);
      res.send("Something went wrong. Try again later");
      return;
    }



    res.send(result);
  })()
});
const checkUserAndEvent = async (userId, eventId,res) => {
  let result = await User.checkUser(userId);

  if(!result){
    res.status(404);
    res.send("User with userid "+ userId+ " doesn't exists");
    return null;
  }

  result = Event.checkEvent(eventId);


  if(!result){
    res.status(404);
    res.send("Event with eventid "+ eventId+ " doesn't exists");
    return null;
  }

  return true;
}
module.exports = router;