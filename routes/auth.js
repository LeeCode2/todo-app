const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const validateRegisterInput = require("../validation/registerValidation");
const jwt = require("jsonwebtoken");
const requireAuth = require("../middleware/permissions");

// @route  GET/api/auth/test
//@desc    Test the auth route
//@access  Is public
router.get("/test", (req, res) => {
  res.send("Auth Router is good");
});

// @route  POST/api/auth/register
//@desc    Create a new user
//@access  Is public

router.post("/register", async (req, res) => {
  try {
    const { errors, isValid } = validateRegisterInput(req.body);

    if (!isValid) {
      return res.status(400).json(errors);
    }
    //Check for existing user
    const existingEmail = await User.findOne({
      email: new RegExp("^" + req.body.email + "$", "i"),
    });

    if (existingEmail) {
      return res.status(400).json({ error: "This email is already in use" });
    }

    //Hash password here
    const hashedPassword = await bcrypt.hash(req.body.password, 12);
    //Create a new user
    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
    });

    // Save user in database
    const savedUser = await newUser.save();
    const userToReturn = { ...savedUser._doc };
    delete userToReturn.password;
    //Return the new user here
    return res.json(userToReturn);
  } catch (err) {
    //Catch error here
    console.log(err);
    res.status(500).send(err.message);
  }
});

// @route  POST/api/auth/login
//@desc    Login user and return a access token
//@access  Is public

router.post("/login", async (req, res) => {
  try {
    //Check for user
    const user = await User.findOne({
      email: new RegExp("^" + req.body.email + "$", "i"),
    });
    if (!user) {
      return res.status(400).json({ error: "Check email or password " });
    }

    const passwordMatch = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(400).json({ error: "Check email or password " });
    }

    const payload = { userId: user._id };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("access-token", token, {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    const userToReturn = { ...user._doc };
    delete userToReturn.password;

    return res.json({
      token: token,
      user: userToReturn,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send(err.message);
  }
});

// @route  GET/api/auth/current
//@desc    Return the currently authed user
//@access  Is Private
router.get("/current", requireAuth, (req, res) => {
  if (!req.user) {
    return res.status(401).send("Unauthorized");
  }

  return res.json(req.user);
});

module.exports = router;
