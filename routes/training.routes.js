const express = require("express");
const router = express.Router();
const Training = require("../models/TrainingModel");
router.post("", (req, res, next) => {
  (async () => {
    const workouts = req.body.workouts;

    if (workouts.length) {
      const result = Training.checkWorkouts(workouts);
      if (!result) {
        res.status(500);
        res.send("Invalid workout");
        return;
      }
    }


    const training = new Training(req.body.time, req.body.name, req.body.intensity, req.body.description, req.body.avg_calories, req.body.numOfSets,req.body.restBetweenSets,req.body.restBetweenWorkouts,workouts);
    const result = await training.addWorkout();

    if(!result){
      res.status(500);
      res.send("Can't add training");
      return;
    }

    res.status(200);
    res.send("OK");
  })();
});

router.get("/all-training", (req,res,next) => {
  (async () => {
      const data = await Training.getAllTraining();

      if(data === null){
        res.status(500);
        res.send("Something went wrong. Try again later");
        return;
      }

      res.status(200);
      res.send(data);
  })()
})

router.get("/:trainingId", (req,res,next) => {
  (async () => {
    const trainingId = req.params.trainingId;

    const result = await Training.checkTraining(trainingId);

    if(!result){
      res.status(404);
      res.send("Training with id " + trainingId +" doesn't exist");
      return;
    }

    const data = await Training.getById(trainingId);

    if(!data){
      res.status(404);
      res.send("Please try again later");
      return;
    }
    res.send(data);

  })()
})

module.exports = router;