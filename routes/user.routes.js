const express = require("express");
const router = express.Router();

const User = require("../models/UserModel");
const fs = require("fs");
const sharp = require("sharp");

module.exports = router;
//TODO: userProfile
router.get("/:id", (req, res, next) => {});

router.get("/allUsers/:id", (req, res, next) => {
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

//TODO: follow user
router.post("/follow", (req, res, next) => {
  (async () => {
    const userIdFollowed = req.body.followed;
    const userIdFollowedBy = req.body.followedBy;

    if (!userIdFollowedBy || !userIdFollowed) {
      res.send("Error. Expected 2 users");
      return;
    }

    const result = await User.follow(userIdFollowed, userIdFollowedBy);

    if (!result) {
      res.status(500);
      res.send("Something went wrong. Please try again later");
      return;
    }
    res.send("Successfully");
  })();
});

//TODO: unfollow user
router.post("/unfollow", (req, res, next) => {
  (async () => {
    const userIdFollowed = req.body.followed;
    const userIdFollowedBy = req.body.followedBy;

    if (!userIdFollowedBy || !userIdFollowed) {
      res.send("Error. Expected 2 users");
      return;
    }

    const result = await User.unfollow(userIdFollowed, userIdFollowedBy);

    if (!result) {
      res.status(500);
      res.send("Something went wrong. Please try again later");
      return;
    }
    res.send("Successfully");
  })();
});
