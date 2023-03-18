const express = require("express");
const cors = require("cors");

let app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const signupRoute = require("./routes/signup.routes");
const signingRoute = require("./routes/signin.routes");
const userRoute = require("./routes/user.routes");

const PORT = 3001;

app.use("/sign-up", signupRoute);
app.use("/sign-in", signingRoute);
app.use("/user", userRoute);

app.listen(PORT, () => {
  console.log("Server listening on port " + PORT);
});
