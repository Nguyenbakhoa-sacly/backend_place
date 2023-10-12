
const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator')
const getCoordsForAddress = require('../util/location')
const HttpError = require('../models/http-error')
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

const getPlaceById = (req, res, next) => {
  const placeId = req.params.pid; //{pid:'p1'}
  const place = DUMMY_PLACES.find(p => p.id === placeId);
  if (!place) {
    throw new HttpError(
      'Could not find a place for the provided id.', 404);
  }
  res.json({ place });
}

const getPlacesByUserId = (req, res, next) => {
  const userId = req.params.uid; //{creatorId:'a1'}
  const places = DUMMY_PLACES.filter(p => p.creatorId === userId);
  if (!places || places.length === 0) {
    return next(new HttpError('Could not find a places for the provided user id.', 404));
  }
  res.json({ places });
}

const createPlace = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    )
  }
  // Lấy dữ liệu người dùng từ request body.
  const { title, description, address, creatorId
  } = req.body;

  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address)
  } catch (e) {
    next(e)
  }

  const createPlace = {
    id: uuidv4(),
    title,
    description,
    location: coordinates,
    address,
    creatorId
  }
  DUMMY_PLACES.push(createPlace);
  res.status(201).json({ place: createPlace })
};

const updatePlaceById = (req, res, next) => {

  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    throw new HttpError('Invalid inputs passed, please check your data.', 422)
  }
  const { title, description } = req.body
  const placeId = req.params.pid;
  //Tìm id cần cập nhật
  const updatePlace = { ...DUMMY_PLACES.find(p => p.id === placeId) };
  const placeIndex = DUMMY_PLACES.findIndex(p => p.id === placeId)

  //thay the
  updatePlace.title = title;
  updatePlace.description = description;

  DUMMY_PLACES[placeIndex] = updatePlace
  res.status(200).json({ place: updatePlace })
}

const deletePlaceById = (req, res, next) => {
  const placeId = req.params.pid;
  //kiem tra xem id co ton tai hay khong
  if (!DUMMY_PLACES.find(p => p.id === placeId)) {
    throw new HttpError('Could not find a place for that id', 404)
  }

  DUMMY_PLACES = DUMMY_PLACES.filter(p => p.id !== placeId);
  res.status(200).json({ message: 'Deleted place.' })
}

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlaceById = updatePlaceById;
exports.deletePlaceById = deletePlaceById;



