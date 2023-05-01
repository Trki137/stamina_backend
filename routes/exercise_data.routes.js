const express = require("express");
const router = express.Router();
const Exercise = require("../models/ExerciseDataModel");
const User = require("../models/UserModel");
const Training = require("../models/TrainingModel");
router.post("", (req,res,next) => {
  (async () => {
    const {name,date,userId,trainingId, time, calories,avg_hearth_rate} = req.body;

    let result = await User.checkUser(userId);

    if(!result){
      res.status(404);
      res.send("User with id "+userId + " doesn't exist");
      return;
    }

    result = await Training.checkTraining(trainingId);

    if(!result){
      res.status(404);
      res.send("Training with id "+trainingId + " doesn't exist");
      return;
    }

    const exerciseModel = new Exercise(name,date,userId,trainingId,time,calories,avg_hearth_rate);

    result = await exerciseModel.saveExerciseData();
    if(!result){
      res.status(500);
      res.send("Try again later");
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
      res.send("User with id "+userId + " doesn't exist");
      return;
    }

    const userData = await Exercise.getUserData(userId);
    const avgData = await Exercise.getAvgUserData(userId);

    const data = {
      userData,
      avgData
    }

    res.send(data);
  })()
});

module.exports = router;