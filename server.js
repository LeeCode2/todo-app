require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

//Import Routes
const authRoute = require("./routes/auth");

const app = express();

app.use(express.json());
app.use(express.urlencoded());

app.get("/api", (req, res) => {
  res.send("This is the todo app");
});

app.use("/api/auth", authRoute);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Database Connected");

    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT} `);
    });
  })
  .catch((error) => {
    console.log(error);
  });
