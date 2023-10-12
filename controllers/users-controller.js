
const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator')
const HttpError = require('../models/http-error')

let DUMMY_USERS = [
  {
    id: 'u1',
    name: 'Khoa nguyen',
    email: 'test@example.com',
    password: 'khoa12345'
  }
]

const getUsers = (req, res, next) => {
  res.status(200).json({
    users: DUMMY_USERS
  })
}

const signup = (req, res, next) => {

  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    console.log(errors);
    throw new HttpError('Invalid inputs passed, please check your data.', 422)
  }
  const { name, email, password } = req.body;
  //Kiểm tra email đã tồn tại hay chua
  const hasUser = DUMMY_USERS.find(user => user.email === email);
  if (hasUser) {
    throw new HttpError('Could not create user, email already exists.', 422)
  }
  const createUser = {
    id: uuidv4(),
    name,
    email,
    password
  }
  DUMMY_USERS.push(createUser);
  res.status(201).json({ users: createUser })
}

const login = (req, res, next) => {
  const { email, password } = req.body;
  const indentifiedUser = DUMMY_USERS.find(user => user.email === email);
  if (!indentifiedUser || indentifiedUser.password !== password) {
    throw new HttpError('Could not identify user, credentials seem to be wrong.', 401);
  }
  res.json({ message: 'Logged in successfully' })

}
exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;


