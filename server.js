const app = require("./app");
const mongoose = require("mongoose");

const DB = "mongodb://localhost:27017/auth";

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => {
    console.log("Connected to MongoDB local");
  });

app.listen(3000, "localhost", () => {
  console.log("Server Started");
});
