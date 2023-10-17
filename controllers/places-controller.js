
const { validationResult } = require('express-validator')
const mongoose = require('mongoose');
const getCoordsForAddress = require('../util/location')
const HttpError = require('../models/http-error')
const Place = require('../models/place');
const User = require('../models/user');

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid; //{pid:'id'}
  let place;
  try {
    //tra ve 1 du lieu
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError('Something went wrong, could not find a place.', 500);
    return next(error);
  }
  if (!place) {
    const error = new HttpError(
      'Could not find a place for the provided id.', 404);
    next(error);
  }
  //tra ve du lieu va xoa gach phia truoc id
  res.json({ place: place.toObject({ getters: true }) });
}

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid; //{creatorId:'a1'}
  // let places;
  let userWidthPlaces;
  try {
    //Trả về 1 mảng dữ liệu
    // places = await Place.find({ creatorId: userId })

    // Tìm địa chỉ bằng cách lấy địa chỉ người tạo
    userWidthPlaces = await User.findById(userId).populate('places')

  } catch (e) {
    const error = new HttpError(
      'Fetching places failed, please try again later.', 500);
    return next(error);
  }

  if (!userWidthPlaces || userWidthPlaces.length === 0) {
    return next(new HttpError('Could not find a places for the provided user id.', 404));
  }
  res.json({ places: userWidthPlaces.places.map(place => place.toObject({ getters: true })) });
}


const createPlace = async (req, res, next) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    )
  }
  // Lấy dữ liệu người dùng từ request body.
  const { title, description, address, creatorId } = req.body;

  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address)
  } catch (e) {
    next(e)
  }

  const createPlace = new Place({
    title,
    description,
    address,
    location: coordinates,
    image: 'https://cf.shopee.vn/file/93cb74f9521e03a605128d4df7addc9c',
    creatorId
  });

  let user;
  try {
    //kiem tra id nguoi tao co ton tai hay khong
    user = await User.findById(creatorId);
  } catch (e) {
    return next(
      new HttpError('Creating place failed, please try again.', 500)
    )
  }

  if (!user) {
    return next(
      new HttpError('Could not find user for provided id', 404)
    )
  }

  try {
    //?
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createPlace.save({ session: sess });
    user.places.push(createPlace);
    await user.save({ session: sess });
    await sess.commitTransaction();

  } catch (err) {
    const error = new HttpError(
      "Creating place failed, please try again.",
      500);
    return next(error);
  }
  res.status(201).json({ place: createPlace })
};

const updatePlaceById = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422))
  }
  const { title, description } = req.body
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (e) {
    const error = new HttpError('Something went wrong, could not update place.', 500);
    return next(error);
  }
  //thay the
  place.title = title;
  place.description = description;

  try {
    await place.save();
  } catch (e) {
    const error = new HttpError('Something went wrong, could not update place.', 500);
    return next(error);
  }

  res.status(200).json({ place: place.toObject({ getters: true }) });
}

const deletePlaceById = async (req, res, next) => {
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId).populate('creatorId');

  } catch (e) {
    const error = new HttpError('Something went wrong, could not delete place.', 500)
    return next(error);
  }

  if (!place) {
    return next(new HttpError('Could not find place for this id.', 404))
  }

  try {
    //?
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await place.deleteOne({ session: sess });
    place.creatorId.places.pull(place)
    await place.creatorId.save({ session: sess });
    await sess.commitTransaction();

  } catch (e) {
    const error = new HttpError('Something went wrong, could not delete place.', 500);
    return next(error);
  }

  res.status(200).json({ message: 'Deleted place.' })
}

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlaceById = updatePlaceById;
exports.deletePlaceById = deletePlaceById;



