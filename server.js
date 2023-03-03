const express = require("express");
const cors = require("cors");

let app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const PORT = 3001;

app.listen(PORT, () => {
    console.log("Server listening on port " + PORT);
});