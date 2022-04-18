const validator = require("validator");
const isEmpty = require("./isEmpty");

const validateRegisterInput = (data) => {
  let errors = {};

  //Check Name
  if (isEmpty(data.name)) {
    errors.name = "Name is required";
  } else if (!validator.isLength(data.name, { min: 2, max: 30 })) {
    errors.name = "Name must be between 2 and 30 characters long";
  }

  //Check Email
  if (isEmpty(data.email)) {
    errors.email = "Email is required";
  } else if (!validator.isEmail(data.email)) {
    errors.email = "Email is invalid, please provide a valid email";
  }

  //Check Password
  if (isEmpty(data.password)) {
    errors.email = "Password is required";
  } else if (!validator.isLength(data.password, { min: 6, max: 150 })) {
    errors.password = "Password must be between 6 and 150 characters long";
  }

  //Check confirm password
  if (isEmpty(data.confirmPassword)) {
    errors.confirmPassword = "Confirm password is required";
  } else if (!validator.equals(data.password, data.confirmPassword)) {
    errors.confirmPassword = "Password do not match";
  }
  return { errors, isValid: isEmpty(errors) };
};

module.exports = validateRegisterInput;
