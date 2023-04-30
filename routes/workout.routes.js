const express = require('express');
const router = express.Router();
const Workout = require("../models/WorkoutModel");
router.post("", (req,res,next) => {
  (async () => {
    const equipment = req.body.equipment;
    if(equipment.length > 0){
      const result = await Workout.checkEquipment(equipment);
      if(!result){
        res.status(404);
        res.send("Equipment not found");
        return;
      }
    }

    const muscleTargeted = req.body.muscleTargeted;
    if(muscleTargeted.length > 0) {
      const result = await Workout.checkMuscles(muscleTargeted);
      if(!result){
        res.status(404);
        res.send("Muscle not found");
        return;
      }
    }

    const workout = new Workout(req.body.name,req.body.description,req.body.intensity,equipment,muscleTargeted);

    const result = await workout.addWorkout();

    if(!result){
      res.status(500);
      res.send("Couldn't save workout");
      return;
    }

    res.status(200);
    res.send("OK");

  })();
});

router.get("", (req,res,next) => {
  (async () => {
    const result = await Workout.getAllWorkouts();

    if(!result){
      res.status(500);
      res.send("Can't retrieve data.");
      return;
    }

    res.send(result);
  })();
});
module.exports = router;