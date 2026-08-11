const LostItem = require('../models/LostItem');
const FoundItem = require('../models/FoundItem');

exports.searchItems = async (req, res) => {
  try {
    const { 
      q, 
      category, 
      location, 
      status, 
      itemType, 
      startDate, 
      endDate, 
      page = 1, 
      limit = 10 
    } = req.query;

    const query = {};

    if (q) {
      query.$text = { $search: q };
    }
    if (category) query.category = category;
    if (location) query.location = { $regex: location, $options: 'i' };
    if (status) query.status = status;

    let lostQuery = { ...query };
    let foundQuery = { ...query };

    if (startDate || endDate) {
      const dateFilter = {};
      if (startDate) dateFilter.$gte = new Date(startDate);
      if (endDate) dateFilter.$lte = new Date(endDate);
      lostQuery.dateLost = dateFilter;
      foundQuery.dateFound = dateFilter;
    }

    let results = [];
    const sortDef = q ? { score: { $meta: 'textScore' } } : { createdAt: -1 };
    const selectDef = q ? { score: { $meta: 'textScore' } } : {};

    if (itemType === 'LostItem') {
      results = await LostItem.find(lostQuery, selectDef)
        .populate('reportedBy', 'name email')
        .sort(sortDef)
        .lean();
      results = results.map(item => ({ ...item, itemType: 'LostItem' }));
    } else if (itemType === 'FoundItem') {
      results = await FoundItem.find(foundQuery, selectDef)
        .populate('reportedBy', 'name email')
        .sort(sortDef)
        .lean();
      results = results.map(item => ({ ...item, itemType: 'FoundItem' }));
    } else {
      const [lost, found] = await Promise.all([
        LostItem.find(lostQuery, selectDef).populate('reportedBy', 'name email').sort(sortDef).lean(),
        FoundItem.find(foundQuery, selectDef).populate('reportedBy', 'name email').sort(sortDef).lean()
      ]);
      
      const mappedLost = lost.map(item => ({ ...item, itemType: 'LostItem' }));
      const mappedFound = found.map(item => ({ ...item, itemType: 'FoundItem' }));
      
      results = [...mappedLost, ...mappedFound];
      
      if (q) {
        results.sort((a, b) => b.score - a.score);
      } else {
        results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
    }

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = results.length;
    const paginatedResults = results.slice(startIndex, endIndex);

    res.status(200).json({
      success: true,
      count: paginatedResults.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      data: paginatedResults
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
