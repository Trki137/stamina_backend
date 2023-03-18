const express = require("express");
const router = express.Router();

const User = require("../models/UserModel");
const sharp = require("sharp");

router.get("/followers/:id", (req, res, next) => {
  (async () => {
    const id = req.params.id;

    let result = await User.getFollowers(id);
    result = await convertImage(result);

    res.send(result);
  })();
});

router.get("/following/:id", (req, res, next) => {
  (async () => {
    const id = req.params.id;

    let result = await User.getFollowing(id);
    result = await convertImage(result);

    res.send(result);
  })();
});

router.get("/:id", (req, res, next) => {
  (async () => {
    const id = req.params.id;

    const result = await User.getProfile(id);

    if (!result) {
      res.status(404);
      res.send("User not found");
      return;
    }

    if (result.image) {
      const imagePath = "./images/" + result.image;
      const imageBuffer = await sharp(imagePath)
        .resize(100)
        .jpeg({ quality: 100 })
        .toBuffer();
      result.image = imageBuffer.toString("base64");
    }

    res.send(result);
  })();
});

router.get("/allUsers/:id", (req, res, next) => {
  (async () => {
    const id = req.params.id;

    let result = await User.getOtherUsers(id);

    if (!result) {
      res.status(500);
      res.send("An error occurred, please try again later.");
      return;
    }

    result = await convertImage(result);
    console.log(result);

    res.send(result);
  })();
});
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

const convertImage = async (data) => {
  for (let i = 0; i < data.length; i++) {
    if (data[i].image) {
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

module.exports = router;
