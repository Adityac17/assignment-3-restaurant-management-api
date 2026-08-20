const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');

const isBlank = (value) => typeof value !== 'string' || value.trim() === '';

const validateRating = (rating) => {
  if (rating === undefined || rating === null || rating === '') return undefined;
  const numeric = Number(rating);
  if (Number.isNaN(numeric)) throw new ApiError(400, 'Rating must be a number');
  if (numeric < 0 || numeric > 5) throw new ApiError(400, 'Rating must be between 0 and 5');
  return numeric;
};

const getRestaurants = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.city) filter.city = new RegExp(`^${req.query.city.trim()}$`, 'i');
  if (req.query.cuisine) filter.cuisine = new RegExp(`^${req.query.cuisine.trim()}$`, 'i');

  const [restaurants, total] = await Promise.all([
    Restaurant.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Restaurant.countDocuments(filter)
  ]);

  sendSuccess(
    res,
    200,
    { restaurants, pagination: { page, limit, total, pages: Math.ceil(total / limit) } },
    'Restaurants fetched successfully'
  );
});

const getTopRestaurants = asyncHandler(async (req, res) => {
  const restaurants = await Restaurant.find().sort({ rating: -1 }).limit(5).lean();
  sendSuccess(res, 200, restaurants, 'Top 5 restaurants fetched successfully');
});

const getRestaurantById = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id).lean();
  if (!restaurant) throw new ApiError(404, 'Restaurant not found');
  sendSuccess(res, 200, restaurant, 'Restaurant fetched successfully');
});

const createRestaurant = asyncHandler(async (req, res) => {
  const { name, city, address, cuisine, rating } = req.body;

  if (isBlank(name) || isBlank(city) || isBlank(address) || isBlank(cuisine)) {
    throw new ApiError(400, 'name, city, address and cuisine are required');
  }

  const restaurant = await Restaurant.create({
    name: name.trim(),
    city: city.trim(),
    address: address.trim(),
    cuisine: cuisine.trim(),
    rating: validateRating(rating) ?? 0
  });

  sendSuccess(res, 201, restaurant, 'Restaurant created successfully');
});

const updateRestaurant = asyncHandler(async (req, res) => {
  const { name, city, address, cuisine, rating } = req.body;
  const updates = {};

  for (const [key, value] of Object.entries({ name, city, address, cuisine })) {
    if (value === undefined) continue;
    if (isBlank(value)) throw new ApiError(400, `${key} cannot be empty`);
    updates[key] = value.trim();
  }

  const parsedRating = validateRating(rating);
  if (parsedRating !== undefined) updates.rating = parsedRating;

  if (Object.keys(updates).length === 0) {
    throw new ApiError(400, 'No valid fields provided to update');
  }

  const restaurant = await Restaurant.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true
  }).lean();

  if (!restaurant) throw new ApiError(404, 'Restaurant not found');
  sendSuccess(res, 200, restaurant, 'Restaurant updated successfully');
});

const deleteRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findByIdAndDelete(req.params.id).lean();
  if (!restaurant) throw new ApiError(404, 'Restaurant not found');

  // Remove orphaned menu items along with their restaurant.
  const { deletedCount } = await MenuItem.deleteMany({ restaurantId: restaurant._id });

  sendSuccess(
    res,
    200,
    { id: restaurant._id, deletedMenuItems: deletedCount },
    'Restaurant deleted successfully'
  );
});

module.exports = {
  getRestaurants,
  getTopRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant
};
