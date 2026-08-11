const { Filter } = require('bad-words');

// Initialize the filter
const filter = new Filter();

// You can easily add custom words to the blocklist if needed
// filter.addWords('customBadWord');

exports.containsProfanity = (text) => {
  if (!text) return false;
  return filter.isProfane(text);
};
