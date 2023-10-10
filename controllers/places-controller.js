
// const uuid = require('uuid/v4');
const { v4: uuidv4 } = require('uuid');
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
    creatorId: 'a1'
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
    creatorId: 'a2'
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

const getPlaceByUserId = (req, res, next) => {
  const userId = req.params.uid; //{creatorId:'a1'}
  const place = DUMMY_PLACES.find(p => p.creatorId === userId);
  if (!place) {
    return next(new HttpError('Could not find a place for the provided user id.', 404));
  }
  res.json({ place });
}

const createPlace = (req, res, next) => {
  // Lấy dữ liệu người dùng từ request body.
  const { title, description, coordinates, address, creatorId
  } = req.body;
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
  DUMMY_PLACES = DUMMY_PLACES.filter(p => p.id !== placeId);
  res.status(200).json({ message: 'Deleted place.' })
}

exports.getPlaceById = getPlaceById;
exports.getPlaceByUserId = getPlaceByUserId;
exports.createPlace = createPlace;
exports.updatePlaceById = updatePlaceById;
exports.deletePlaceById = deletePlaceById;



