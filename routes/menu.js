const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { updateMenuItem, deleteMenuItem } = require('../controllers/menuController');

const router = express.Router();

router.put('/:id', authMiddleware, updateMenuItem);
router.delete('/:id', authMiddleware, deleteMenuItem);

module.exports = router;
