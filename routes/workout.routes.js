const express = require('express');
const router = express.Router();
const Workout = require("../models/WorkoutModel");
const {validateAddWorkout} = require("../validation/workoutValidation");
router.post("", (req,res,next) => {
  (async () => {
    const {error, value} = validateAddWorkout(req.body);

    if(error){
      res.status(400);
      res.send("Invalid body.");
      return;
    }

    const {equipment, muscleTargeted,name,description,intensity} = value;

    if(equipment && equipment.length > 0){
      const result = await Workout.checkEquipment(equipment);
      if(!result){
        res.status(404);
        res.send("Equipment not found");
        return;
      }
    }

    if(muscleTargeted.length > 0) {
      const result = await Workout.checkMuscles(muscleTargeted);
      if(!result){
        res.status(404);
        res.send("Muscle not found");
        return;
      }
    }

    const workout = new Workout(name,description,intensity,equipment,muscleTargeted);

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