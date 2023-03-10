const express = require("express");
const router = express.Router();
const User = require("../models/UserModel");
const fs = require("fs");

router.post("", (req, res, next) => {
  (async () => {
    const username = req.body.username;
    const password = req.body.password;

    let result = await User.checkUsernameExists(username);

    if (result) {
      res.status(404);
      console.log(result);
      res.send(result);
      return;
    }

    let user = new User(username, null, password, null, null);

    result = await user.signin();
    delete result.password;

    if (result.image) {
      const imagePath = "./images/" + result.image;
      const imageData = fs.readFileSync(imagePath);
      const base64ImageData = Buffer.from(imageData).toString("base64");
      const data = { user: result, image: base64ImageData };

      res.send(data);
      return;
    }

    res.send(result);
  })();
});

module.exports = router;
