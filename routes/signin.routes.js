const express = require("express");
const router = express.Router();
const User = require("../models/UserModel");
const fs = require("fs");
const {googleSignIn,signIn} = require("../validation/signInValidator");

router.post("", (req, res, next) => {
  (async () => {
    const {error, value} = signIn(req.body);

    if(error){
      res.status(422);
      res.send(error.details);
      return;
    }

    const {username, password} = value;

    if (!username) {
      res.status(500);
      res.send("No username");
    }

    let result = await User.checkUsernameExists(username);

    if (result) {
      res.status(404);
      console.log(result);
      res.send(result);
      return;
    }

    let user = new User(null, null, username, null, password, null, null);

    result = await user.signin();
    delete result.password;

    if (result.image) {
      const imagePath = "./images/" + result.image;
      const imageData = fs.readFileSync(imagePath);
      const base64ImageData = Buffer.from(imageData).toString("base64");
      const data = {user: result, image: base64ImageData};

      res.send(data);
      return;
    }

    res.send(result);
  })();
});


router.post("/google-sign-in", (req,res,next) => {
  (async () => {
    const {error, value} = googleSignIn(req.body);

    if(error){
      res.status(422);
      res.send(error.details);
      return;
    }

    const {email,username, firstname, lastname,image} = value;

    let result = await User.checkUsernameExists(username);

    if(!result){
      result = await User.getUser(username);
      res.send(result);
      return;
    }

    const user = new User(firstname,lastname,username,email,null,image,null);
    result = await user.saveGoogleLogin();
    if(!result){
      res.status(500);
      res.send("Please try again later");
      return;
    }

    res.send(result);
  })();
})

module.exports = router;
