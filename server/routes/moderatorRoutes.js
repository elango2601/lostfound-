const express = require('express');
const {
  getModeratorDashboard,
  addModeratorNote,
  getItemClaimsOverview
} = require('../controllers/moderatorController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(authorize('moderator', 'admin'));

router.get('/dashboard', getModeratorDashboard);
router.put('/claims/:id/note', addModeratorNote);
router.get('/claims/item/:itemId', getItemClaimsOverview);

module.exports = router;
