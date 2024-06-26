
const express = require('express');
const { check } = require('express-validator');
const placesControllers = require('../controllers/places-controller')
const fileUpload = require('../middleware/file-upload')
const checkAuth = require('../middleware/check-auth');
const router = express.Router();

router.get('/:pid', placesControllers.getPlaceById)

router.get('/user/:uid', placesControllers.getPlacesByUserId)

router.use(checkAuth);
router.post(
  '/',
  fileUpload.single('image'),
  [
    //check xem tieu de co de trong hay khong
    check('title').not().isEmpty(),
    //check xem description co du do dai hay khong
    check('description').isLength({ min: 5 }),
    //check xem dai chi co de trong hay khong
    check('address').not().isEmpty(),
  ],
  placesControllers.createPlace)

router.patch('/:pid',
  [
    check('title').not().isEmpty(),
    check('description').isLength({ min: 5 }),
  ],
  placesControllers.updatePlaceById)

router.delete('/:pid', placesControllers.deletePlaceById)

module.exports = router;

