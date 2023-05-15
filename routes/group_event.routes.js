const express = require("express");
const router = express.Router();
const Event = require("../models/EventModel");
const User = require("../models/UserModel");
const GroupEvent = require("../models/GroupEventModel");
const City = require("../models/CityModel");
const Address = require("../models/AddressModel");
const convertImage = require("../util/util");
const {validateSaveGroupEvent,validateUpdateGroupeEvent,validateUserId} = require("../validation/groupEventValidation");

router.post("", (req,res,next) => {
  (async () => {
    const {error, value} = validateSaveGroupEvent(req.body);

    if(error){
      res.status(400);
      res.send("Invalid body");
      return
    }

    const {name, description,userId, max_space,date_time, street,pbr,cityName,latitude,longitude} = value;

    let result = await User.checkUser(userId);

    if(!result){
      res.status(404);
      res.send("User with userid "+ userId+ " doesn't exists");
      return null;
    }

    const groupEvent = new GroupEvent(name, description,userId, max_space,date_time, street,pbr,cityName,latitude,longitude);

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
    const {error, value} = validateUserId(req.params);

    if(error){
      res.status(400);
      res.send("Invalid body");
      return
    }

    const {id} = value;

    let result = await GroupEvent.getAllEvents(id);

    if(!result){
      res.status(500);
      res.send("Something went wrong. Try again later");
      return;
    }

    await convertImage(result);

    res.send(result);

  })()
});

router.put("", (req,res,next) => {
  (async () =>  {
    const {error, value} = validateUpdateGroupeEvent(req.body);

    if(error){
      res.status(400);
      res.send("Invalid body");
      return
    }
    const {max_space,date_time,eventId,cityId,pbr,name,addressId,street,latitude,longitude,eventName, description} = value;
    let result = await Event.checkEvent(eventId);
    if(!result){
      res.status(404);
      res.send("Event with id "+ eventId + " does not exist");
      return;
    }

    result = await City.checkCity(cityId)
    if(!result){
      res.status(404);
      res.send("City with id "+ cityId + " does not exist");
      return;
    }

    result = await Address.checkAddress(addressId);
    if(!result){
      res.status(404);
      res.send("Address with id "+ addressId + " does not exist");
      return;
    }

    result = await GroupEvent.updateGroupEvent(max_space,date_time,eventId,cityId,pbr,name,addressId,street,latitude,longitude,eventName,description);

    if(!result){
      res.status(500);
      res.send("Try again later");
      return;
    }

    res.send("OK");

  })()
})

module.exports = router;