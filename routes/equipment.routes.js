const express = require('express');
const router = express.Router();
const Equipment = require('../models/EquipmentModel');
router.get("", (req,res,next) => {
  (async () => {
    const result = await Equipment.getAllEquipment();

    if(!result){
      res.status(500);
      res.send("Couldn't get data");
      return;
    }

    res.send(result);
  })();
});
module.exports = router;