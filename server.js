const express = require("express");
const cors = require("cors");

let app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const signupRoute = require("./routes/signup.routes");
const signingRoute = require("./routes/signin.routes");
const userRoute = require("./routes/user.routes");
const muscleRoute = require("./routes/muscle_group.routes");
const workoutRoute = require("./routes/workout.routes");
const equipmentRoute = require("./routes/equipment.routes");
const trainingRoute = require("./routes/training.routes");
const challengeRoute = require("./routes/challenge.routes");

const PORT = 3001;

app.use("/training", trainingRoute);
app.use("/muscle",muscleRoute);
app.use("/workout",workoutRoute);
app.use("/equipment",equipmentRoute);
app.use("/sign-up", signupRoute);
app.use("/sign-in", signingRoute);
app.use("/user", userRoute);
app.use("/challenge",challengeRoute)

app.listen(PORT, () => {
  console.log("Server listening on port " + PORT);
});
