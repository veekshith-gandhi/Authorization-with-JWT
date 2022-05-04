const express = require("express");
const errController = require("./controller/errController");
const AppError = require("./utils/appError");
const router = require("./route/userRouter");
const morgan = require("morgan");

const app = express();

app.use(express.json());

app.use(morgan("dev"));

app.use("/", router);
app.all("*", (req, res, next) => {
  next(new AppError(`No route Found With given ${req.originalUrl}`));
});
app.use(errController.errHandler);
module.exports = app;
