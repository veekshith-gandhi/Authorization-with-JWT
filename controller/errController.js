//this is the last error handling middleware

exports.errHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "Error";
  res.status(err.statusCode).json({
    Caution: "Handeled in Error Handler",
    status: err.status,
    message: err.message,
  });
};
