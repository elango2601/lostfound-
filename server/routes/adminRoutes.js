const express = require('express');
const {
  getUsers,
  updateUserRole,
  deleteUser,
  getActivityLogs,
  getAdminStats
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { cacheMiddleware } = require('../utils/cache');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.route('/users')
  .get(getUsers);

router.route('/users/:id')
  .delete(deleteUser);

router.route('/users/:id/role')
  .put(updateUserRole);

router.route('/activity')
  .get(getActivityLogs);

router.route('/stats')
  .get(cacheMiddleware(120), getAdminStats);

module.exports = router;
