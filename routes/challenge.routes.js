const express = require('express');
const router = express.Router();
const Challenge = require("../models/ChallengeModel");
const Event = require("../models/EventModel");
const convertImage = require("../util/util");

router.get("/:id", (req,res,next) => {
  (async () => {
    let result = await Challenge.getAllChallenges(req.params.id);

    if(!result){
      res.status(500);
      res.send("Please try again later.");
      return;
    }

   await convertImage(result);

    res.status(200);
    res.send(result);
  })();
})

router.post("", (req, res,next) => {
  (async () => {
    const {name,description,userId,date} = req.body;

    const challenge = new Challenge(userId,name,description,date);
    let result = await challenge.saveChallenge();

    if(!result){
      res.status(500);
      res.send("Please try again later.");
      return;
    }

    await convertImage(result)

    res.status(200);
    res.send(result[0]);
  })()
});

router.put("", (req,res,next) => {
  (async () => {
    const {eventId, date,name,description} = req.body;

    let result = await Event.checkEvent(eventId);

    if(!result){
      res.status(404);
      res.send("Event with id "+ eventId + " doesn't exists");
      return;
    }

    result = await Challenge.update(eventId,date,name,description);

    if(!result){
      res.status(500);
      res.send("Please try again later");
      return;
    }

    res.send(200);

  })()
})

module.exports = router;