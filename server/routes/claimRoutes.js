const express = require('express');
const {
  createClaim,
  getClaims,
  getClaim,
  updateClaimStatus
} = require('../controllers/claimController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .get(protect, getClaims)
  .post(protect, createClaim);

router.route('/:id')
  .get(protect, getClaim);

router.route('/:id/status')
  .put(protect, authorize('moderator', 'admin'), updateClaimStatus);

module.exports = router;
