const express = require('express');
const {
  createLostItem,
  getLostItems,
  getLostItem,
  updateLostItem,
  deleteLostItem,
  getLostItemMatches
} = require('../controllers/lostItemController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .get(getLostItems)
  .post(protect, createLostItem);

router.route('/:id/matches')
  .get(protect, getLostItemMatches);

router.route('/:id')
  .get(getLostItem)
  .put(protect, updateLostItem)
  .delete(protect, deleteLostItem);

module.exports = router;
