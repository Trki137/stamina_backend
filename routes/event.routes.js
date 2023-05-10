const express = require("express");
const router = express.Router();
const Event = require("../models/EventModel");
const User = require("../models/UserModel");
const GroupEvent = require("../models/GroupEventModel");
const Challenge = require("../models/ChallengeModel");
const convertImage = require("../util/util");
const {validateEvent} = require("../validation/eventValidator");


router.post("/", (req,res,next) => {
  (async () => {

    const {error, value} = validateEvent(req.body);

    if(error){
      console.log(error);
      res.status(422);
      res.send(error.details);
      return;
    }

    console.log(value);

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
    const {error, value} = validateEvent(req.body);

    if(error){
      console.log(error);
      res.status(422);
      res.send(error.details);
      return;
    }

    const {userId, eventId} = req.body;
    let result = await checkUserAndEvent(userId,eventId,res);

    if(!result) return;

    result = await Event.unJoinEvent(userId, eventId);

    if(!result){
      res.status(500);
      res.send("Something went wrong. Try again later");
      return;

    }

    res.send(result);
  })()
});

router.put("", (req,res,next) => {
  (async () => {
    const {error, value} = validateEvent(req.body);

    if(error){
      console.log(error);
      res.status(422);
      res.send(error.details);
      return;
    }

    const {userId,eventId} = req.body;

    let result = await User.checkUser(userId);

    if(!result){
      res.status(404);
      res.send("User with id "+userId+" doesn't exist");
      return;
    }

    result = await Event.checkEvent(eventId);

    if(!result){
      res.status(404);
      res.send("User with id "+userId+" doesn't exist");
      return;
    }

    result = await Event.finishEvent(userId, eventId);

    if(!result){
      res.status(500);
      res.send("Please try again later.");
      return;
    }

    res.send("OK");

  })()
});

router.get("/:userId", (req,res,next) => {
  (async () => {
    const userId = req.params.userId;

    const result = await User.checkUser(userId);

    if(!result){
      res.status(404);
      res.send("User with id "+userId+" doesn't exist");
      return;
    }

    const my_challenges = await Challenge.getMyChallenges(userId);
    const my_events = await GroupEvent.getMyEvents(userId);

    await convertImage(my_events);
    await convertImage(my_challenges);

    const data = {
      my_events,
      my_challenges
    };

    res.send(data);
  })();
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