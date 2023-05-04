const express = require("express");
const router = express.Router();
const Exercise = require("../models/ExerciseDataModel");
const User = require("../models/UserModel");
const Training = require("../models/TrainingModel");
const multer = require("multer");
const gpxParser = require("gpxparser")
const GpxParser = require("gpxparser");
const storage = multer.memoryStorage();
const TCXParser = require("../util/TCXParser");
const FITParser = require("../util/FITParser");

const upload = multer({storage: storage});
const uploadFile = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./tcxFile");
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + "_" + file.originalname);
    },
  }),
});
router.post("", (req,res,next) => {
  (async () => {
    const {name,date,userId,trainingId, time, calories,avg_hearth_rate} = req.body;

    let result = await User.checkUser(userId);

    if(!result){
      res.status(404);
      res.send("User with id "+userId + " doesn't exist");
      return;
    }
    if(!trainingId)
      result = await Training.checkTraining(trainingId);

    if(trainingId && !result){
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



router.get("/:userId" ,(req,res,next) => {
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

router.post("/file",upload.single('file'), (req,res,next) => {
  (async () => {
    const file = req.file;
    const userId = JSON.parse(req.body.userId);

    let result = await User.checkUser(userId);

    if(!result){
      res.status(404);
      res.send("User with id "+userId + " doesn't exist");
      return;
    }

    const fitParser = new FITParser(file.buffer);
    const data = await fitParser.getData();

    if(!data){
      res.status(403);
      res.send("Invalid file.");
      return;
    }

    data.userId = userId;
    result = await data.saveExerciseData();

    if(!result){
      res.status(500);
      res.send("Please try again later.")
      return;
    }

    res.send("OK");
  })();
});

router.post("/file-tcx",uploadFile.single('file'), (req,res,next) => {
  (async () => {
    const userId = JSON.parse(req.body.userId);

    let result = await User.checkUser(userId);

    if(!result){
      res.status(404);
      res.send("User with id "+userId + " doesn't exist");
      return;
    }


    const path = "./tcxFile/" + req.file.filename;
    const tcxParser = new TCXParser(path);
    let data = null;

    try{
      data = tcxParser.parseAndGetData();
    }catch (e){
      res.status(403);
      res.send("Invalid file.");
      return;
    }

    if(!data){
      res.status(403);
      res.send("Invalid file.");
      return;
    }

    data.userId = userId;
    result = await data.saveExerciseData();

    if(!result){
      res.status(500);
      res.send("Please try again later.")
      return;
    }

    res.send("OK");
  })()

});

module.exports = router;
