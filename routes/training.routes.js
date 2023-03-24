const express = require("express");
const router = express.Router();
const Training = require("../models/TrainingModel");
router.post("/add-training", (req, res, next) => {
  (async () => {
    console.log(req.body);

    const workouts = req.body.workouts;

    if (workouts.length) {
      const result = Training.checkWorkouts(workouts);
      if (!result) {
        res.status(500);
        res.send("Invalid workout");
        return;
      }
    }

    const training = new Training(req.body.time, req.body.name, req.body.intensity, req.body.description, req.body.avg_calories, workouts);

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

module.exports = router;