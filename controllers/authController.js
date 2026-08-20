const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isBlank = (value) => typeof value !== 'string' || value.trim() === '';

const register = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (isBlank(username) || isBlank(email) || isBlank(password)) {
    throw new ApiError(400, 'username, email and password are required');
  }
  if (!EMAIL_REGEX.test(email.trim())) {
    throw new ApiError(400, 'Invalid email format');
  }
  if (password.length < 6) {
    throw new ApiError(400, 'Password must be at least 6 characters');
  }

  const existing = await User.findOne({
    $or: [{ email: email.trim().toLowerCase() }, { username: username.trim() }]
  }).lean();

  if (existing) {
    throw new ApiError(400, 'A user with that email or username already exists');
  }

  const user = await User.create({
    username: username.trim(),
    email: email.trim().toLowerCase(),
    password
  });

  sendSuccess(res, 201, user, 'User registered successfully');
});

const login = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if ((isBlank(email) && isBlank(username)) || isBlank(password)) {
    throw new ApiError(400, 'email (or username) and password are required');
  }

  const query = isBlank(email)
    ? { username: username.trim() }
    : { email: email.trim().toLowerCase() };

  const user = await User.findOne(query);

  // Same message for unknown user and wrong password: do not leak which accounts exist.
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const token = jwt.sign(
    { userId: user._id.toString(), username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  sendSuccess(res, 200, { token, user }, 'Login successful');
});

module.exports = { register, login };
