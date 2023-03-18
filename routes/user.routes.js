const express = require("express");
const router = express.Router();

const User = require("../models/UserModel");
const fs = require("fs");
const sharp = require("sharp");

module.exports = router;
//TODO: userProfile
router.get("/:id", (req, res, next) => {
  (async () => {
    const id = req.params.id;

    const result = await User.getOtherUsers(id);

    if (!result) {
      res.send("An error occurred, please try again later.");
      return;
    }

    for (let i = 0; i < result.length; i++) {
      if (result[i].image) {
        const imagePath = "./images/" + result[i].image;
        const imageBuffer = await sharp(imagePath)
          .resize(100)
          .jpeg({ quality: 100 })
          .toBuffer();
        result[i].image = imageBuffer.toString("base64");
      }
    }

    res.send(result);
  })();
});

router.get("/allUsers/:id", (req, res, next) => {});

//TODO: follow user
router.post("/follow", (req, res, next) => {});

//TODO: unfollow user
router.post("/unfollow", (req, res, next) => {});
