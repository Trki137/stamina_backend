const express = require("express");
const router = express.Router();
const Training = require("../models/TrainingModel");
const {validateTrainingId, validateSaveTraining} = require("../validation/trainingValidation");
router.post("", (req, res, next) => {
  (async () => {

    const {error, value} = validateSaveTraining(req.body);

    if(error){
      req.status(400);
      req.send("Invalid body");
      return;
    }

    const { workouts , time,name,intensity, description, avg_calories, numOfSets,restBetweenSets,restBetweenWorkouts} = value;


    if (workouts.length) {
      const result = Training.checkWorkouts(workouts);
      if (!result) {
        res.status(500);
        res.send("Invalid workout");
        return;
      }
    }


    const training = new Training(time, name, intensity, description, avg_calories, numOfSets,restBetweenSets,restBetweenWorkouts,workouts);
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
    const { error, value } = validateTrainingId(req.params);

    if(error){
      res.status(400);
      res.send("Invalid parameter.");
      return;
    }

    const { trainingId } = value;

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