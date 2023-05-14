const express = require("express");
const router = express.Router();
const User = require("../models/UserModel");
const sharp = require("sharp");
const multer = require("multer");
const fs = require("fs");
const {validateFollowUnfollow,validateParamUserId,validateUpdateWithoutImage} = require("../validation/userValidator");

const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./images");
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + "_" + file.originalname);
    },
  }),
});

router.get("/followers/:id", (req, res, next) => {
  (async () => {
    const {error, value} = validateParamUserId(req.params);

    if(error){
      res.status(422);
      res.send(error.details);
      return;
    }

    const {id} = value;

    let result = await User.getFollowers(id);
    result = await convertImage(result);

    res.send(result);
  })();
});

router.get("/following/:id", (req, res, next) => {
  (async () => {
    const {error, value} = validateParamUserId(req.params);

    if(error){
      res.status(422);
      res.send(error.details);
      return;
    }

    const {id} = value;

    let result = await User.getFollowing(id);
    result = await convertImage(result);

    res.send(result);
  })();
});

router.get("/allUsers/:id", (req, res, next) => {
  (async () => {
    const {error, value} = validateParamUserId(req.params);

    if(error){
      res.status(422);
      res.send(error.details);
      return;
    }

    const {id} = value;

    let result = await User.getOtherUsers(id);

    if (!result) {
      res.status(500);
      res.send("An error occurred, please try again later.");
      return;
    }

    result = await convertImage(result);

    res.send(result);
  })();
});
router.post("/follow", (req, res, next) => {
  (async () => {
    const {error, value} = validateFollowUnfollow(req.body);

    if(error){
      res.status(422);
      res.send(error.details);
      return;
    }

    const {followed,followedBy} = value;

    let result = await User.checkUser(followed);

    if(!result){
      res.status(404);
      res.send("User with userid "+ followed+" doesn't exist");
      return;
    }

    result = await User.checkUser(followedBy);

    if(!result){
      res.status(404);
      res.send("User with userid "+ followedBy +" doesn't exist");
      return;
    }

    result = await User.follow(followed, followedBy);

    if (!result) {
      res.status(500);
      res.send("Something went wrong. Please try again later");
      return;
    }
    res.send("Successfully");
  })();
});
router.post("/unfollow", (req, res, next) => {
  (async () => {
    const {error, value} = validateFollowUnfollow(req.body);

    if(error){
      res.status(422);
      res.send(error.details);
      return;
    }

    const {followed,followedBy} = value;


    let result = await User.checkUser(followed);

    if(!result){
      res.status(404);
      res.send("User with userid "+ followed+" doesn't exist");
      return;
    }

    result = await User.checkUser(followedBy);

    if(!result){
      res.status(404);
      res.send("User with userid "+ followedBy +" doesn't exist");
      return;
    }

    result = await User.unfollow(followed, followedBy);

    if (!result) {
      res.status(500);
      res.send("Something went wrong. Please try again later");
      return;
    }
    res.send("Successfully");
  })();
});

const convertImage = async (data) => {
  for (let i = 0; i < data.length; i++) {
    if (data[i].image) {
      if(data[i].image.startsWith("http")) continue;
      const imagePath = "./images/" + data[i].image;
      const imageBuffer = await sharp(imagePath)
        .resize(100)
        .jpeg({ quality: 100 })
        .toBuffer();
      data[i].image = imageBuffer.toString("base64");
    }
  }

  return data;
};

router.post("/:id", (req, res, next) => {
  (async () => {
    const {error, value} = validateParamUserId(req.params);

    if(error){
      console.log("Here")
      res.status(422);
      res.send(error.details);
      return;
    }


    const {id} = value;

    const currentUserId = req.body.id;

    if(typeof currentUserId === "string"){
      if(!(new RegExp(/^\d+$/).test(currentUserId))){
        res.status(422);
        res.send("Invalid id.");
        return;
      }
    }else {
      if(Number.isNaN(currentUserId)){
        res.status(422);
        res.send("Invalid id.");
        return;
      }
    }


    const result = await User.getProfile(id, currentUserId);

    if (!result) {
      res.status(404);
      res.send("User not found");
      return;
    }

    if (result.image && !result.image.startsWith("http")) {
      const imagePath = "./images/" + result.image;
      const imageBuffer = await sharp(imagePath)
        .resize(100)
        .jpeg({ quality: 100 })

        .toBuffer();
      result.image = imageBuffer.toString("base64");
    }

    result.isfollowing = result.isfollowing !== null;

    res.send(result);
  })();
});

router.put("/update/:id", (req, res, next) => {
  (async () => {

    const {error,value} = validateUpdateWithoutImage(req.body);

    if(error){
      res.status(422);
      res.send(error.details);
      return;
    }

    const {firstname,lastname,username,email,description} = value;


    const userId = req.params.id;

    let result = await User.checkUser(req.params.id);

    if(!result){
      res.status(404);
      res.send("User with userid "+ followed+" doesn't exist");
      return;
    }

    const oldImageName = await User.getImage(userId);
    const user = new User(
      firstname,
      lastname,
      username,
      email,
      null,
      oldImageName,
      description
    );

    result = await user.update(userId);

    if (!result) {
      res.status(500);
      res.send("Error on server");
      return;
    }

    res.send("Success");
  })();
});
router.put(
  "/update-with-image/:id",
  upload.single("image"),
  (req, res, next) => {
    (async () => {
      const userId = req.params.id;
      const fileName = req.file.filename;
      const userData = JSON.parse(req.body.userInfo);

      const oldImageName = await User.getImage(userId);

      if (oldImageName) {
        fs.unlink("./images/" + oldImageName, (err) => {
          if (err) throw err;
        });

        console.log(oldImageName + " deleted successfully");
      }

      const user = new User(
        userData.firstname,
        userData.lastname,
        userData.username,
        userData.email,
        null,
        fileName,
        userData.description
      );

      const result = await user.update(userId);

      if (!result) {
        res.status(500);
        res.send("Error on server");
        return;
      }

      const imagePath = "./images/" + fileName;
      const imageData = fs.readFileSync(imagePath);
      const base64ImageData = Buffer.from(imageData).toString("base64");
      const data = { user, image: base64ImageData };

      delete user.password;
      res.send(data);
    })();
  }
);

module.exports = router;
