const express = require("express");
const router = express.Router();

const User = require("../models/UserModel");
const sharp = require("sharp");

const multer = require("multer");
const fs = require("fs");

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
    const id = req.params.id;
    const currentUserId = req.body.id;
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
    const userId = req.params.id;
    console.log(userId);
    const oldImageName = await User.getImage(userId);

    const user = new User(
      req.body.firstname,
      req.body.lastname,
      req.body.username,
      req.body.email,
      null,
      oldImageName,
      req.body.description
    );

    console.log(user);
    const result = await user.update(userId);

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
