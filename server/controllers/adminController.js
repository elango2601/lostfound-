const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const LostItem = require('../models/LostItem');
const FoundItem = require('../models/FoundItem');
const Claim = require('../models/Claim');

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-passwordHash').sort('-createdAt').lean();
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['user', 'moderator', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, error: 'Invalid role specified' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
       return res.status(400).json({ success: false, error: 'Cannot delete your own admin account' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    await user.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getActivityLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find({})
      .populate('actorId', 'name email role')
      .sort('-timestamp')
      .limit(100)
      .lean();
      
    res.status(200).json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getAdminStats = async (req, res) => {
  try {
    const [
      lostStatusCounts,
      foundStatusCounts,
      claimStatusCounts,
      lostByCategory,
      foundByCategory,
      lostByLocation,
      recoveryByMonth,
      topLostCategory,
      topLostLocation,
      totalUsers
    ] = await Promise.all([
      LostItem.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      FoundItem.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Claim.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      LostItem.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      FoundItem.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      LostItem.aggregate([{ $group: { _id: '$location', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      FoundItem.aggregate([
        { $match: { status: { $in: ['CLAIMED', 'RETURNED', 'RECOVERED'] } } },
        { 
          $group: { 
            _id: { $dateToString: { format: "%Y-%m", date: "$updatedAt" } }, 
            count: { $sum: 1 } 
          } 
        },
        { $sort: { _id: 1 } }
      ]),
      LostItem.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 1 }]),
      LostItem.aggregate([{ $group: { _id: '$location', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 1 }]),
      User.aggregate([{ $count: "totalUsers" }])
    ]);

    res.status(200).json({
      success: true,
      data: {
        totals: {
          users: totalUsers[0] ? totalUsers[0].totalUsers : 0
        },
        itemStats: {
          lost: lostStatusCounts,
          found: foundStatusCounts
        },
        claims: claimStatusCounts,
        categories: {
          lost: lostByCategory,
          found: foundByCategory,
          mostFrequentLost: topLostCategory[0] || null
        },
        locations: {
          lost: lostByLocation,
          mostCommonLost: topLostLocation[0] || null
        },
        trends: {
          recoveryByMonth
        }
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
