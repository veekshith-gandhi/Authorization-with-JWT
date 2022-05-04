const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const resetToken = require("./../utils/resetTokenCreater");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "User Should have Name"],
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
  email: {
    type: String,
    required: [true, "User Must Have Email to SignIN"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Password Is Must"],
    minlength: [5, "Password length should be atleast 5"],
    select: false,
  },
  confirmPassword: {
    type: String,
    required: true,
    validate: {
      validator: function (val) {
        return val === this.password;
      },
      message: "Password didn't match",
    },
  },
  passwordChanged: {
    type: Date,
  },
  passwordResetToken: String,
  passwordResetTokenExpires: Date,
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});

userSchema.methods.checkpassword = async function (inputpassword, DBStoredPWD) {
  return await bcrypt.compare(inputpassword, DBStoredPWD);
};

userSchema.methods.passwordModified = function (JWTTimeStamp) {
  if (this.passwordChanged) {
    const checkpasswordAt = parseInt(this.passwordChanged.getTime() / 1000, 10);
    return checkpasswordAt < JWTTimeStamp;
  }
  return false;
};

userSchema.methods.resetToken = function () {
  const token = resetToken.resetTokenGen(32);
  this.passwordResetToken = resetToken.haskedResetToken(token);
  this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000;
  return token;
};

const User = mongoose.model("Users", userSchema);

module.exports = User;
