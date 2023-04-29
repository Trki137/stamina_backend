const express = require('express');
const router = express.Router();
const Challenge = require("../models/ChallengeModel");

router.get("", (req,res,next) => {
  (async () => {
    let result = await Challenge.getAllChallenges();

    if(!result){
      res.status(500);
      res.send("Please try again later.");
      return;
    }

    res.status(200);
    res.send(result);
  })();
})

router.post("", (req, res,next) => {
  (async () => {
    const {name,description, workoutId,userId,date} = req.body;

    const challenge = new Challenge(userId,name,description,date,workoutId);
    let result = await challenge.saveChallenge();

    if(!result){
      res.status(500);
      res.send("Please try again later.");
      return;
    }

    res.status(200);
    res.send("OK");
  })()
});

module.exports = router;