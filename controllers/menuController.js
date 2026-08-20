const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');

const isBlank = (value) => typeof value !== 'string' || value.trim() === '';

const validatePrice = (price) => {
  const numeric = Number(price);
  if (price === undefined || price === null || price === '' || Number.isNaN(numeric)) {
    throw new ApiError(400, 'price must be a number');
  }
  if (numeric < 0) throw new ApiError(400, 'price must be a positive value');
  return numeric;
};

const validateAvailability = (isAvailable) => {
  if (isAvailable === undefined) return undefined;
  if (typeof isAvailable === 'boolean') return isAvailable;
  if (isAvailable === 'true') return true;
  if (isAvailable === 'false') return false;
  throw new ApiError(400, 'isAvailable must be a boolean');
};

const getMenuByRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id).lean();
  if (!restaurant) throw new ApiError(404, 'Restaurant not found');

  const menu = await MenuItem.find({ restaurantId: restaurant._id })
    .sort({ createdAt: -1 })
    .lean();

  sendSuccess(res, 200, menu, 'Menu fetched successfully');
});

const createMenuItem = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id).lean();
  if (!restaurant) throw new ApiError(404, 'Restaurant not found');

  const { name, price, isAvailable } = req.body;
  if (isBlank(name)) throw new ApiError(400, 'name is required');

  const item = await MenuItem.create({
    restaurantId: restaurant._id,
    name: name.trim(),
    price: validatePrice(price),
    isAvailable: validateAvailability(isAvailable) ?? true
  });

  sendSuccess(res, 201, item, 'Menu item created successfully');
});

const updateMenuItem = asyncHandler(async (req, res) => {
  const { name, price, isAvailable } = req.body;
  const updates = {};

  if (name !== undefined) {
    if (isBlank(name)) throw new ApiError(400, 'name cannot be empty');
    updates.name = name.trim();
  }
  if (price !== undefined) updates.price = validatePrice(price);

  const availability = validateAvailability(isAvailable);
  if (availability !== undefined) updates.isAvailable = availability;

  if (Object.keys(updates).length === 0) {
    throw new ApiError(400, 'No valid fields provided to update');
  }

  const item = await MenuItem.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true
  }).lean();

  if (!item) throw new ApiError(404, 'Menu item not found');
  sendSuccess(res, 200, item, 'Menu item updated successfully');
});

const deleteMenuItem = asyncHandler(async (req, res) => {
  const item = await MenuItem.findByIdAndDelete(req.params.id).lean();
  if (!item) throw new ApiError(404, 'Menu item not found');
  sendSuccess(res, 200, { id: item._id }, 'Menu item deleted successfully');
});

module.exports = { getMenuByRestaurant, createMenuItem, updateMenuItem, deleteMenuItem };
