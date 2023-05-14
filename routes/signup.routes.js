const express = require("express");
const router = express.Router();
const User = require("../models/UserModel");
const multer = require("multer");
const fs = require("fs");
const {validateSingUp} = require("../validation/signUpValidation");
const e = require("express");

const fileFilter = function(req,file,cb){
  if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
    cb(null,true);
  }else cb(new Error("Invalid image."), false);
}
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./images");
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + "_" + file.originalname);
    },
  }),
  fileFilter: fileFilter
});

router.post("", (req, res, next) => {
  (async () => {
    const {error, value} = validateSingUp(req.body);

    if(error){
      res.status(400);
      res.send("Invalid body");
      return;
    }

    const {email,username,firstname,lastname,password} = value;

    let result = await checkUser(username, email);

    if (result) {
      res.status(409);
      res.send(result);
      return;
    }

    const user = new User(
      firstname,
      lastname,
      username,
      email,
      password,
      null,
      null
    );

    await user.signup();

    res.send("OK");
  })();
});

router.post("/sign-up-with-image", upload.single("image"), (req, res, next) => {
  (async () => {
    const fileName = req.file.filename;
    const userData = JSON.parse(req.body.userInfo);

    const {error, value} = validateSingUp(userData);

    if(error){
      res.status(400);
      res.send("Invalid body");
      return;
    }

    const {email,username,firstname,lastname,password} = value;

    const result = await checkUser(username, email);
    if (result) {
      res.status(409);
      res.send(result);
      return;

    }

    const user = new User(
      firstname,
      lastname,
      username,
      email,
      password,
      fileName,
      null
    );
    await user.signup();

    res.send("OK");
  })();
});

const checkUser = async (username, email) => {
  let result = await User.checkEmail(email);

  if (result) {
    return result;
  }
  result =await User.checkUsername(username);

  return result ? result : false;
};

module.exports = router;
