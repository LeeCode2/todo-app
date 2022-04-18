const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const validateRegisterInput = require("../validation/registerValidation");

// @route  Get/api/auth/test
//@desc    Test the auth route
//@access  Is public
router.get("/test", (req, res) => {
  res.send("Auth Router is good");
});

// @route  Post/api/auth/register
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

    //Return the new user here
    return res.json(savedUser);
  } catch (err) {
    //Catch error here
    console.log(err);
    res.status(500).send(err.message);
  }
});
module.exports = router;
