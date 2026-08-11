const FoundItem = require('../models/FoundItem');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');
const { containsProfanity } = require('../services/moderationService');
const { analyzeReportTrust } = require('../services/fraudDetectionService');

exports.createFoundItem = async (req, res) => {
  try {
    if (containsProfanity(req.body.title) || containsProfanity(req.body.description)) {
      return res.status(400).json({ success: false, error: 'Inappropriate language detected. Please revise your submission.' });
    }

    const fraudAnalysis = analyzeReportTrust(req.body.title, req.body.description, req.body.category, !!req.body.imageUrl);
    req.body.trustScore = fraudAnalysis.trustScore;
    req.body.fraudFlags = fraudAnalysis.fraudFlags;

    req.body.reportedBy = req.user.id;
    
    const existing = await FoundItem.findOne({
      title: req.body.title,
      category: req.body.category,
      location: req.body.location,
      status: 'FOUND'
    });
    if (existing) req.body.isPossibleDuplicate = true;

    const foundItem = await FoundItem.create(req.body);
    
    await AuditLog.create({
      itemId: foundItem._id,
      actorId: req.user.id,
      action: 'FOUND_ITEM_REPORTED',
      previousStatus: 'NONE',
      newStatus: 'FOUND'
    });

    await Notification.create({
      userId: req.user.id,
      message: `Your found item report for "${foundItem.title}" has been successfully created.`,
      type: 'REPORT_CREATED'
    });

    res.status(201).json({ success: true, data: foundItem });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getFoundItems = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const query = {};
    if (req.query.reportedBy) {
        query.reportedBy = req.query.reportedBy;
    }

    const total = await FoundItem.countDocuments(query);
    const foundItems = await FoundItem.find(query)
      .skip(startIndex)
      .limit(limit)
      .populate('reportedBy', 'name email')
      .sort('-createdAt');

    res.status(200).json({ 
      success: true, 
      count: foundItems.length, 
      total,
      page,
      pages: Math.ceil(total / limit),
      data: foundItems 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getFoundItem = async (req, res) => {
  try {
    const foundItem = await FoundItem.findById(req.params.id).populate('reportedBy', 'name email');
    if (!foundItem) {
      return res.status(404).json({ success: false, error: 'Found item not found' });
    }
    res.status(200).json({ success: true, data: foundItem });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateFoundItem = async (req, res) => {
  try {
    let foundItem = await FoundItem.findById(req.params.id);
    
    if (!foundItem) {
      return res.status(404).json({ success: false, error: 'Found item not found' });
    }

    if (foundItem.reportedBy.toString() !== req.user.id && req.user.role === 'user') {
      return res.status(403).json({ success: false, error: 'Not authorized to update this item' });
    }

    foundItem = await FoundItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: foundItem });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteFoundItem = async (req, res) => {
  try {
    const foundItem = await FoundItem.findById(req.params.id);
    
    if (!foundItem) {
      return res.status(404).json({ success: false, error: 'Found item not found' });
    }

    if (foundItem.reportedBy.toString() !== req.user.id && req.user.role === 'user') {
      return res.status(403).json({ success: false, error: 'Not authorized to delete this item' });
    }

    await foundItem.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
