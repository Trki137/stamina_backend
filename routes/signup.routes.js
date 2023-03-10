const express = require("express");
const router = express.Router();
const User = require("../models/UserModel");

router.post("", (req, res, next) => {
  (async () => {
    const email = req.body.email;
    const username = req.body.username;

    let result = await User.checkEmail(email);

    if (result) {
      res.send(result);
      return;
    }

    result = await User.checkUsername(username);

    if (result) {
      res.send(result);
      return;
    }

    const user = new User(username, email, req.body.password, null, null);

    await user.signup();

    res.send(user);
  })();
});

router.post("sign-up-with-image", (req, res, next) => {});

module.exports = router;
