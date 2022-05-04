const User = require("./../model/userModel");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const AppError = require("./../utils/appError");
const emailer = require("./../utils/emailer");
const resetTokenCheck = require("./../utils/resetTokenCreater");

const JWT_SECRET = "dwadbwabiudgwabudygxbwakdygduyweg8gigaifh";
const JWT_EXPIRES = 60 * 5;
const tokenCreater = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES,
  });
};

const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((err) => next(err));
  };
};

exports.signup = async (req, res) => {
  try {
    const userDetails = {
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      confirmPassword: req.body.confirmPassword,
      role: req.body.role,
      passwordChanged: req.body.passwordChanged,
    };

    const user = await User.create(userDetails);
    const token = tokenCreater(user.id);

    if (!token) {
      return Error;
    }
    res.status(201).json({
      status: "Success",
      token,
      user,
    });
  } catch (err) {
    res.status(400).json({
      status: "Failed",
      message: err,
    });
  }
};

exports.getAllUsers = async (req, res) => {
  const user = await User.find()
    .select("-passwordChanged")
    .select("-role")
    .select("-__v")
    .select("-_id");

  res.status(200).json({
    status: "Success",
    user,
  });
};

exports.login = async (req, res) => {
  const user = await User.findOne({ email: req.body.email }).select(
    "+password"
  );
  if (!user || !(await user.checkpassword(req.body.password, user.password))) {
    res.status(404).json({
      status: "Not authorized",
    });
    return Error;
  } else {
    const token = tokenCreater(user.id);
    res.status(200).json({
      token,
      status: "Logged In",
    });
  }
};

exports.delete = async (req, res) => {
  await User.deleteMany();
  res.status(200).json({
    status: "Deleted",
  });
};

exports.restrict = catchAsync(async (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) return next(new AppError("No Token Recieved", 401));
    const decoded = await promisify(jwt.verify)(token, JWT_SECRET);
    const currentUser = await User.findById(decoded.id || decoded);
    if (!currentUser)
      return next(new AppError("User Doesn't belong to this Token"));

    if (!currentUser.passwordModified(decoded.iat))
      return next(new AppError("Password was Changed recently", 401));

    req.user = currentUser;
    next();
  } else {
    return next(new AppError("Not Authorized", 401));
  }
});

exports.adminCheck = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError("You Don't have access here"));
    }
    next();
  };
};

exports.resetPassword = catchAsync(async (req, res, next) => {
  const tokenInput = req.params.token;
  const decodedToken = resetTokenCheck.haskedResetToken(tokenInput);
  const user = await User.findOne({
    passwordResetToken: decodedToken,
    passwordResetTokenExpires: { $gt: Date.now() },
  });
  if (!user) return next(new AppError("Token Expired", 500));
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpires = undefined;
  await user.save();
  const token = tokenCreater(user.id);
  res.status(200).json({
    user,
    token,
  });
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email: email });
  if (!user)
    return next(
      new AppError(`couldn't find user with this email : ${email} `, 401)
    );

  const resetToken = user.resetToken();
  await user.save({ validateBeforeSave: false });
  const reserURL = `${req.protocol}://${req.get("host")}/reset/${resetToken} }`;
  const message = `Forgot Password click ${reserURL} and submit new Password if u didn't just ignore`;
  try {
    await emailer({
      email: user.email,
      subject: "Password Reset Valid For 10 min",
      message,
    });
  } catch (err) {
    console.log(err);
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    user.save({ validateBeforeSave: false });
    return next(new AppError("Email send Failed", 500));
  }

  res.status(201).json({
    status: "Success",
    message: "Mail Sent",
    resetToken,
  });
});
