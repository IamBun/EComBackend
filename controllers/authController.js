const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.postLogin = async (req, res, next) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  try {
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      const error = new Error("Email user not found !");
      error.statusCode = 401;
      throw error;
    }
    let loadedUser = user;

    const isEqual = await bcrypt.compare(userPassword, user.password);
    if (!isEqual) {
      const error = new Error("Password is not true");
      error.statusCode = 401;
      throw error;
    }

    const token = jwt.sign(
      {
        // email: loadedUser.email,
        userId: loadedUser._id.toString(),
        role: loadedUser.role,
        name: loadedUser.name,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );
    req.session.token = token;
    req.session.message = [];
    await req.session.save();

    res.status(200).json({
      token: token,
      userId: loadedUser._id.toString(),
      name: loadedUser.name,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.postRegister = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const name = req.body.name;
  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    const invalidEmail = await User.findOne({ email: email });
    if (invalidEmail) {
      const error = new Error("Email is already exists");
      error.statusCode = 400;
      throw error;
    }
    if (password.length < 6) {
      const error = new Error("Password has at least 6 characters");
      error.statusCode = 400;
      throw error;
    }
    const user = new User({
      email: email,
      password: hashedPassword,
      name: name,
    });
    const result = await user.save();
    res.status(200).json({
      message: "Create user complete ! Login to continue",
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.postAdminLogin = async (req, res, next) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;

  try {
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      const error = new Error("Email user not found !");
      error.statusCode = 401;
      throw error;
    }
    let loadedUser = user;

    const isEqual = await bcrypt.compare(userPassword, user.password);
    if (!isEqual) {
      const error = new Error("Password is not true");
      error.statusCode = 401;
      throw error;
    }
    const roles = ["admin", "support"];
    if (!roles.includes(user.role)) {
      const error = new Error("Unauthorized");
      error.statusCode = 403;
      throw error;
    }

    // Session ???

    const token = jwt.sign(
      {
        // email: loadedUser.email,
        userId: loadedUser._id.toString(),
        role: loadedUser.role,
        name: loadedUser.name,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );
    req.session.token = token;
    req.session.message = [];

    await req.session.save();

    res.status(200).json({
      token: token,
      userId: loadedUser._id.toString(),
      name: loadedUser.name,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.postLogout = async (req, res, next) => {
  await req.session.destroy((err) => {
    if (err) {
      throw new Error("something went wrong while logging out");
    }
    res.status(200).json({ message: "Log out !" });
  });
};
