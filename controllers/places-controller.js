
const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator')
const getCoordsForAddress = require('../util/location')
const HttpError = require('../models/http-error')
const Place = require('../models/place');
let DUMMY_PLACES = [
  {
    id: 'p1',
    title: 'Empire...State Building',
    description: 'One of the most famous sky scrapers in the world!',
    address: '20 W 30th St, New York, NY 10001',
    location: {
      lat: 40.7484405,
      lng: -73.9878584
    },
    creatorId: 'u1'
  },
  {
    id: 'p2',
    title: 'Empire111 State Building',
    description: 'One of the most famous sky scrapers in the world!',
    address: '20 W 30th St, New York, NY 10001',
    location: {
      lat: 40.7484405,
      lng: -73.9878584
    },
    creatorId: 'u2'
  },
]

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid; //{pid:'p1'}
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
  let places;

  try {
    //tra ve 1 mang du lieu 
    places = await Place.find({ creatorId: userId })

  } catch (e) {
    const error = new HttpError(
      'Fetching places failed, please try again later.', 500);
    return next(error);
  }

  if (!places || places.length === 0) {
    return next(new HttpError('Could not find a places for the provided user id.', 404));
  }
  res.json({ places: places.map(place => place.toObject({ getters: true })) });
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
  try {
    await createPlace.save();
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
    throw new HttpError('Invalid inputs passed, please check your data.', 422)
  }
  const { title, description } = req.body
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (e) {
    const error = new HttpError('Something went wrong, could not update place.', 500);
    return nexrt(error);
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
    place = await Place.findById(placeId);

  } catch (e) {
    const error = new HttpError('Something went wrong, could not delete place.', 500)
    return next(error);
  }

  try {
    await place.deleteOne();
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



