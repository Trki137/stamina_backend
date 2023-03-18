const express = require("express");
const router = express.Router();
const User = require("../models/UserModel");
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

router.post("", (req, res, next) => {
  (async () => {
    const email = req.body.email;
    const username = req.body.username;

    const result = await checkUser(username, email);

    if (result) {
      res.status(409);
      res.send(result);
      return;
    }

    const user = new User(
      req.body.firstname,
      req.body.lastname,
      username,
      email,
      req.body.password,
      null,
      null
    );

    await user.signup();

    res.send(user);
  })();
});

router.post("/sign-up-with-image", upload.single("image"), (req, res, next) => {
  (async () => {
    const fileName = req.file.filename;
    const userData = JSON.parse(req.body.userInfo);

    const email = userData.email;
    const username = userData.username;

    const result = await checkUser(username, email);

    if (result) {
      res.status(409);
      res.send(result);
      return;
    }

    const user = new User(
      userData.firstname,
      userData.lastname,
      username,
      email,
      userData.password,
      fileName,
      null
    );
    await user.signup();

    const imagePath = "./images/" + fileName;
    const imageData = fs.readFileSync(imagePath);
    const base64ImageData = Buffer.from(imageData).toString("base64");
    const data = { user, image: base64ImageData };

    delete user.password;
    res.send(data);
  })();
});

const checkUser = async (email, username) => {
  let result = await User.checkEmail(email);

  if (result) {
    return result;
  }

  return await User.checkUsername(username);
};

module.exports = router;
