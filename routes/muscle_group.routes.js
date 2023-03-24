const express = require('express');
const router = express.Router();
const Muscle = require("../models/MuslceModel")
router.get("/all-muscles", (req,res,next) => {
  (async () => {
      const result = await Muscle.getAllMuscles();

      if(!result){
        res.status(500);
        res.send("Couldn't get data");
        return;
      }

      res.send(result);
  })();
});
module.exports = router;