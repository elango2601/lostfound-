const express = require('express');
const { searchItems } = require('../controllers/searchController');
const { cacheMiddleware } = require('../utils/cache');
const router = express.Router();

router.get('/', cacheMiddleware(60), searchItems);

module.exports = router;
