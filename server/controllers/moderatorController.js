const Claim = require('../models/Claim');
const LostItem = require('../models/LostItem');
const FoundItem = require('../models/FoundItem');
const AuditLog = require('../models/AuditLog');

exports.getModeratorDashboard = async (req, res) => {
  try {
    // Fetch actionable lists for the moderator
    const pendingClaims = await Claim.find({ status: { $in: ['PENDING', 'UNDER_REVIEW', 'INFO_REQUESTED'] } })
      .populate('claimantId', 'name email')
      .populate('itemId')
      .sort('createdAt');

    const disputedClaims = await Claim.find({ status: 'DISPUTED' })
      .populate('claimantId', 'name email')
      .populate('itemId')
      .sort('createdAt');

    const recentLostItems = await LostItem.find({ status: 'LOST' })
      .populate('reportedBy', 'name email')
      .sort('-createdAt')
      .limit(20);

    const recentFoundItems = await FoundItem.find({ status: 'FOUND' })
      .populate('reportedBy', 'name email')
      .sort('-createdAt')
      .limit(20);

    const recoveredItems = await FoundItem.find({ status: { $in: ['CLAIMED', 'RETURNED', 'RECOVERED'] } })
      .populate('reportedBy', 'name email')
      .sort('-updatedAt')
      .limit(20);

    const flaggedDuplicates = await Promise.all([
      LostItem.find({ isPossibleDuplicate: true, status: 'LOST' }).populate('reportedBy', 'name email'),
      FoundItem.find({ isPossibleDuplicate: true, status: 'FOUND' }).populate('reportedBy', 'name email')
    ]).then(([lost, found]) => [...lost, ...found]);

    res.status(200).json({
      success: true,
      data: {
        pendingClaims,
        disputedClaims,
        recentLostItems,
        recentFoundItems,
        recoveredItems,
        flaggedDuplicates
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.addModeratorNote = async (req, res) => {
  try {
    const { note } = req.body;
    let claim = await Claim.findById(req.params.id);

    if (!claim) {
      return res.status(404).json({ success: false, error: 'Claim not found' });
    }

    const previousStatus = claim.status;
    claim.moderatorNotes = note;
    claim.status = 'INFO_REQUESTED';
    claim.reviewedBy = req.user.id;
    await claim.save();

    await AuditLog.create({
      itemId: claim.itemId,
      actorId: req.user.id,
      action: 'MODERATOR_INFO_REQUESTED',
      previousStatus,
      newStatus: 'INFO_REQUESTED'
    });

    res.status(200).json({ success: true, data: claim });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getItemClaimsOverview = async (req, res) => {
  try {
    const { itemId } = req.params;
    
    const claims = await Claim.find({ itemId })
      .populate('claimantId', 'name email')
      .populate('reviewedBy', 'name email')
      .sort('createdAt');
      
    res.status(200).json({ success: true, count: claims.length, data: claims });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
