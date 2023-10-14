
const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator')
const HttpError = require('../models/http-error')
const User = require('../models/user');
const { response } = require('express');
let DUMMY_USERS = [
  {
    id: 'u1',
    name: 'Khoa nguyen',
    email: 'test@example.com',
    password: 'khoa12345'
  }
]

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
  const { name, email, password, places } = req.body;
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

  const createdUser = new User({
    name,
    email,
    image: 'https://vn-live-01.slatic.net/p/aef9bebb6093265c86dc34311f507a3e.jpg',
    password,
    places
  });

  try {
    await createdUser.save();
  } catch (e) {
    const error = new HttpError('Signing up failed, please try again later.', 500)
    return next(error);
  }
  res.status(201).json({ users: createdUser.toObject({ getters: true }) })
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

  if (!existingUser || existingUser.password !== password) {
    const error = new HttpError('Invalid credentials, could bot log you in.', 401);
    return next(error);
  }

  res.json({ message: 'Logged in successfully' })

}
exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;


