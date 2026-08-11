const Claim = require('../models/Claim');
const FoundItem = require('../models/FoundItem');
const LostItem = require('../models/LostItem');
const AuditLog = require('../models/AuditLog');

exports.createClaim = async (req, res) => {
  try {
    const { itemId, itemType, description, proof } = req.body;

    if (!itemId || !itemType || !description) {
      return res.status(400).json({ success: false, error: 'Please provide all required fields' });
    }

    let item;
    if (itemType === 'FoundItem') {
      item = await FoundItem.findById(itemId);
    } else {
      item = await LostItem.findById(itemId);
    }

    if (!item) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }

    const existingClaim = await Claim.findOne({ itemId, claimantId: req.user.id });
    if (existingClaim && !['REJECTED', 'COMPLETED'].includes(existingClaim.status)) {
      return res.status(400).json({ success: false, error: 'You already have an active claim for this item' });
    }

    const claim = await Claim.create({
      itemId,
      itemType,
      claimantId: req.user.id,
      description,
      proof,
      status: 'PENDING'
    });

    res.status(201).json({ success: true, data: claim });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getClaims = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'user') {
      query.claimantId = req.user.id;
    } else if (req.query.claimantId) {
      query.claimantId = req.query.claimantId;
    }

    if (req.query.status) query.status = req.query.status;
    if (req.query.itemId) query.itemId = req.query.itemId;

    const claims = await Claim.find(query)
      .populate('claimantId', 'name email')
      .populate('reviewedBy', 'name email')
      .sort('-createdAt');

    res.status(200).json({ success: true, count: claims.length, data: claims });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getClaim = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id)
      .populate('claimantId', 'name email')
      .populate('reviewedBy', 'name email');

    if (!claim) {
      return res.status(404).json({ success: false, error: 'Claim not found' });
    }

    if (req.user.role === 'user' && claim.claimantId._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized to view this claim' });
    }

    res.status(200).json({ success: true, data: claim });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateClaimStatus = async (req, res) => {
  try {
    const { status } = req.body;
    let claim = await Claim.findById(req.params.id);

    if (!claim) {
      return res.status(404).json({ success: false, error: 'Claim not found' });
    }

    if (claim.claimantId.toString() === req.user.id) {
      return res.status(403).json({ success: false, error: 'Server Enforcement: You cannot review or approve your own claim' });
    }

    const previousStatus = claim.status;
    claim.status = status || claim.status;
    claim.reviewedBy = req.user.id;
    await claim.save();

    await AuditLog.create({
      itemId: claim.itemId,
      actorId: req.user.id,
      action: `CLAIM_STATUS_UPDATED_TO_${claim.status}`,
      previousStatus,
      newStatus: claim.status
    });

    if (status === 'APPROVED') {
      if (claim.itemType === 'FoundItem') {
        await FoundItem.findByIdAndUpdate(claim.itemId, { status: 'CLAIMED' });
      } else {
        await LostItem.findByIdAndUpdate(claim.itemId, { status: 'CLAIMED' });
      }
      
      // Dispute Management: Automatically reject competing claims
      await Claim.updateMany(
        { itemId: claim.itemId, _id: { $ne: claim._id }, status: { $nin: ['REJECTED', 'COMPLETED'] } },
        { $set: { status: 'REJECTED', reviewedBy: req.user.id } }
      );
      
      await AuditLog.create({
        itemId: claim.itemId,
        actorId: req.user.id,
        action: 'COMPETING_CLAIMS_AUTO_REJECTED',
        previousStatus: 'VARIOUS',
        newStatus: 'REJECTED'
      });
    }

    res.status(200).json({ success: true, data: claim });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
