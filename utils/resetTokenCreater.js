const crypto = require("crypto");

exports.haskedResetToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

exports.resetTokenGen = (size) => {
  return crypto.randomBytes(size).toString("hex");
};
