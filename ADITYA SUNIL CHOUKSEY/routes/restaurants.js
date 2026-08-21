const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const {
  getRestaurants,
  getTopRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant
} = require('../controllers/restaurantController');
const {
  getMenuByRestaurant,
  createMenuItem
} = require('../controllers/menuController');

const router = express.Router();

// /top must be declared before /:id so it is not swallowed by the id param.
router.get('/top', getTopRestaurants);

router.get('/', getRestaurants);
router.get('/:id', getRestaurantById);
router.post('/', authMiddleware, createRestaurant);
router.put('/:id', authMiddleware, updateRestaurant);
router.delete('/:id', authMiddleware, deleteRestaurant);

// Menu routes nested under a restaurant.
router.get('/:id/menu', getMenuByRestaurant);
router.post('/:id/menu', authMiddleware, createMenuItem);

module.exports = router;
