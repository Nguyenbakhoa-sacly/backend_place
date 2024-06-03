
const { validationResult } = require('express-validator')

const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const HttpError = require('../models/http-error')
const User = require('../models/user');

const getUsers = async (req, res, next) => {
  let users;
  try {
    //loai tru password
    users = await User.find({}, '-password')
  } catch (e) {
    const error = new HttpError('Fetching users failed, please try again later.', 500);
    return next(error);
  }
  res.json({ users: users.map(user => user.toObject({ getters: true })) });
}

const signup = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    )
  }

  const { name, email, password } = req.body;

  let existingUser;
  try {
    //kiem tra email da ton tai hay chua
    existingUser = await User.findOne({ email: email });
  } catch (e) {
    const error = new HttpError('Signing up failed, please try again later.', 500)
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError('User exists already, please login instead.', 422)
    return next(error);
  }
  // Mã hóa password
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12)
  } catch (e) {
    const error = new
      HttpError('Could not create user, please try again.', 500);
    return next(error);
  }

  const createdUser = new User({
    name,
    email,
    image: req.file.path,
    password: hashedPassword,
    places: []
  });

  try {
    await createdUser.save();
  } catch (e) {
    const error = new HttpError('Signing up failed, please try again later.', 500)
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      {
        userId: createdUser.id,
        email: createdUser.email
      },
      'supersecret_dont_share',
      { expiresIn: '1h' }
    )
  } catch (e) {
    const error = new HttpError('Signing up failed, please try again later.', 500)
    return next(error);
  }

  res.status(201)
    .json(
      {
        userId: createdUser.id,
        email: createdUser.email,
        token: token
      }
    )
}

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;
  try {
    //kiem tra email da ton tai hay chua
    existingUser = await User.findOne({ email: email });
  } catch (e) {
    const error = new HttpError('Logging in failed, please try again later.', 500);
    return next(error);
  }

  if (!existingUser) {
    const error = new HttpError(
      'Invalid credentials, could bot log you in.', 403);
    return next(error);
  }

  //theo dõi tính hợp lệ của mật khẩu.
  let isValidPassword = false;
  try {
    // so sánh mất khẩu chuẩn với mất khẩu đã được mã hóa
    // gán kết quả với gia tri boolean cho isValidPassword
    isValidPassword = await bcrypt.compare(
      password, existingUser.password)
  } catch (e) {
    const error = new HttpError(
      'could not log in, please check your credentials and try again', 500);
    return next(error);
  }
  //kiem tra isValidPassword còn false hay không
  if (!isValidPassword) {
    const error = new HttpError(
      'Invalid credentials, could bot log you in.', 401);
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      {
        userId: existingUser.id,
        email: existingUser.email
      },
      'supersecret_dont_share',
      { expiresIn: '1h' }
    )
  } catch (e) {
    const error = new HttpError('Signing up failed, please try again later.', 500)
    return next(error);
  }

  res.json({
    userId: existingUser.id,
    email: existingUser.email,
    token: token
  })
}


exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;


