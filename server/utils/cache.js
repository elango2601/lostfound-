const NodeCache = require('node-cache');

// Standard TTL of 60 seconds
const cache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

const cacheMiddleware = (duration) => (req, res, next) => {
  if (req.method !== 'GET') {
    return next();
  }

  const key = req.originalUrl || req.url;
  const cachedResponse = cache.get(key);

  if (cachedResponse) {
    return res.json(cachedResponse);
  }

  // Override res.json to capture the response body and cache it
  const originalJson = res.json;
  res.json = function (body) {
    // Only cache successful responses
    if (res.statusCode >= 200 && res.statusCode < 300) {
      cache.set(key, body, duration);
    }
    originalJson.call(this, body);
  };

  next();
};

module.exports = { cache, cacheMiddleware };
