const express = require('express');
const router = express.Router();
const Challenge = require("../models/ChallengeModel");
const Event = require("../models/EventModel");
const convertImage = require("../util/util");
const {validateAddChallenge,validateUpdateChallenge,validateGetChallenge} = require("../validation/challengeValidation");

router.get("/:id", (req,res,next) => {
  (async () => {
    const {error, value} = validateGetChallenge(req.params);

    if(error){
      res.status(422);
      res.send(error.details);
      return;
    }

    const {id} = value;

    let result = await Challenge.getAllChallenges(id);

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

    const {error, value} = validateAddChallenge(req.body);

    if(error){
      res.status(422);
      res.send(error.details);
      return;
    }

    const {name,description,userId,date} = value;

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
    const {error, value} = validateUpdateChallenge(req.body);

    if(error){
      res.status(422);
      res.send(error.details);
      return;
    }

    const {eventId,date,name,description} = value;

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