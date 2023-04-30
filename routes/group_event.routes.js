const express = require("express");
const router = express.Router();
const Event = require("../models/EventModel");
const User = require("../models/UserModel");
const GroupEvent = require("../models/GroupEventModel");
const convertImage = require("../util/util");

router.post("", (req,res,next) => {
  (async () => {
    const {name, description,userId, max_space,date_time, street,pbr,cityName} = req.body;

    let result = await User.checkUser(userId);

    if(!result){
      res.status(404);
      res.send("User with userid "+ userId+ " doesn't exists");
      return null;
    }

    const groupEvent = new GroupEvent(name, description,userId, max_space,date_time, street,pbr,cityName);

    result = await groupEvent.saveEvent();

    if(!result){
      res.status(500);
      res.send("Something went wrong. Try again later.");
      return;
    }

    await convertImage([result]);
    res.send(result)
  })()
});


router.get("/:id", (req,res,next) => {
  (async () => {
    let result = await GroupEvent.getAllChallenges(req.params.id);

    if(!result){
      res.status(500);
      res.send("Something went wrong. Try again later");
      return;
    }

    await convertImage(result);

    res.send(result);

  })()
});

module.exports = router;