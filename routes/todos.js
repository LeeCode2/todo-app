const express = require("express");
const router = express.Router();
const ToDo = require("../models/ToDo");
const requiresAuth = require("../middleware/permissions");
const validateToDoInput = require("../validation/toDoValidation");

// @route  GET/api/todos/test
//@desc    Test the todos route
//@access  Is public

router.get("/test", (req, res) => {
  res.send("Todo's router is working");
});

// @route  POST/api/todos/new
//@desc    Create a new todo
//@access  Is private
router.post("/new", requiresAuth, async (req, res) => {
  try {
    const { isValid, errors } = validateToDoInput(req.body);

    if (!isValid) {
      return res.status(400).json(errors);
    }
    // Create a new todo
    const newToDo = new ToDo({
      user: req.user._id,
      content: req.body.content,
      conplete: false,
    });
    await newToDo.save();

    return res.json(newToDo);
  } catch (err) {
    console.log(err);
    return res.status(500).send(err.message);
  }
});

// @route  GET/api/todos/current
//@desc    Return the current user todos
//@access  Is private

router.get("/current", requiresAuth, async (req, res) => {
  try {
    const completeToDos = await ToDo.find({
      user: req.user._id,
      conplete: true,
    }).sort({ completedAt: -1 });

    const incompleteToDos = await ToDo.find({
      user: req.user._id,
      conplete: false,
    }).sort({ completedAt: -1 });

    return res.json({ incomplete: incompleteToDos, complete: completeToDos });
  } catch (err) {
    console.log(err);
    return res.status(500).send(err.message);
  }
});

module.exports = router;
