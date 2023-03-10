const express = require("express");
const router = express.Router();
const User = require("../models/UserModel");

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

    res.send(result);
  })();
});

module.exports = router;
