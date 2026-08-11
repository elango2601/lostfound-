const LostItem = require('../models/LostItem');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');
const { findMatchesForLostItem } = require('../services/matchingService');
const { sendMatchNotification } = require('../services/emailService');
const { containsProfanity } = require('../services/moderationService');
const { analyzeReportTrust } = require('../services/fraudDetectionService');

exports.createLostItem = async (req, res) => {
  try {
    if (containsProfanity(req.body.title) || containsProfanity(req.body.description)) {
      return res.status(400).json({ success: false, error: 'Inappropriate language detected. Please revise your submission.' });
    }

    const fraudAnalysis = analyzeReportTrust(req.body.title, req.body.description, req.body.category, !!req.body.imageUrl);
    req.body.trustScore = fraudAnalysis.trustScore;
    req.body.fraudFlags = fraudAnalysis.fraudFlags;

    req.body.reportedBy = req.user.id;
    
    const existing = await LostItem.findOne({
      title: req.body.title,
      category: req.body.category,
      location: req.body.location,
      status: 'LOST'
    });
    if (existing) req.body.isPossibleDuplicate = true;

    const lostItem = await LostItem.create(req.body);
    
    await AuditLog.create({
      itemId: lostItem._id,
      actorId: req.user.id,
      action: 'LOST_ITEM_REPORTED',
      previousStatus: 'NONE',
      newStatus: 'LOST'
    });

    await Notification.create({
      userId: req.user.id,
      message: `Your lost item report for "${lostItem.title}" has been successfully created.`,
      type: 'REPORT_CREATED'
    });

    const matches = await findMatchesForLostItem(lostItem);
    const strongMatches = matches.filter(m => m.score >= 85);
    if (strongMatches.length > 0) {
      await Notification.create({
        userId: req.user.id,
        message: `Good news! We found ${strongMatches.length} potential matches for your "${lostItem.title}".`,
        type: 'MATCH_FOUND'
      });
      
      const user = await User.findById(req.user.id);
      if (user) {
         await sendMatchNotification(user.email, user.name, lostItem.title, strongMatches[0].foundItem.title, strongMatches[0].score, strongMatches[0].reasons);
      }
    }

    res.status(201).json({ success: true, data: lostItem });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getLostItems = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const query = {};
    if (req.query.reportedBy) {
        query.reportedBy = req.query.reportedBy;
    }

    const total = await LostItem.countDocuments(query);
    const lostItems = await LostItem.find(query)
      .skip(startIndex)
      .limit(limit)
      .populate('reportedBy', 'name email')
      .sort('-createdAt');

    res.status(200).json({ 
      success: true, 
      count: lostItems.length, 
      total,
      page,
      pages: Math.ceil(total / limit),
      data: lostItems 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getLostItem = async (req, res) => {
  try {
    const lostItem = await LostItem.findById(req.params.id).populate('reportedBy', 'name email');
    if (!lostItem) {
      return res.status(404).json({ success: false, error: 'Lost item not found' });
    }
    res.status(200).json({ success: true, data: lostItem });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateLostItem = async (req, res) => {
  try {
    let lostItem = await LostItem.findById(req.params.id);
    
    if (!lostItem) {
      return res.status(404).json({ success: false, error: 'Lost item not found' });
    }

    if (lostItem.reportedBy.toString() !== req.user.id && req.user.role === 'user') {
      return res.status(403).json({ success: false, error: 'Not authorized to update this item' });
    }

    lostItem = await LostItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: lostItem });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteLostItem = async (req, res) => {
  try {
    const lostItem = await LostItem.findById(req.params.id);
    
    if (!lostItem) {
      return res.status(404).json({ success: false, error: 'Lost item not found' });
    }

    if (lostItem.reportedBy.toString() !== req.user.id && req.user.role === 'user') {
      return res.status(403).json({ success: false, error: 'Not authorized to delete this item' });
    }

    await lostItem.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getLostItemMatches = async (req, res) => {
  try {
    const lostItem = await LostItem.findById(req.params.id);
    if (!lostItem) {
      return res.status(404).json({ success: false, error: 'Lost item not found' });
    }
    
    if (lostItem.reportedBy.toString() !== req.user.id && req.user.role === 'user') {
      return res.status(403).json({ success: false, error: 'Not authorized to view matches for this item' });
    }
    
    const matches = await findMatchesForLostItem(lostItem);
    
    res.status(200).json({ success: true, count: matches.length, data: matches });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
