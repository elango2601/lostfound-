const express = require('express');
const {
  createFoundItem,
  getFoundItems,
  getFoundItem,
  updateFoundItem,
  deleteFoundItem
} = require('../controllers/foundItemController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .get(getFoundItems)
  .post(protect, createFoundItem);

router.route('/:id')
  .get(getFoundItem)
  .put(protect, updateFoundItem)
  .delete(protect, deleteFoundItem);

module.exports = router;
