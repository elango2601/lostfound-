const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  itemType: { type: String, enum: ['LostItem', 'FoundItem'], required: true },
  claimantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String, required: true },
  proof: { type: String }, // imageUrl/documentUrl for proof
  status: { 
    type: String, 
    enum: ['PENDING', 'UNDER_REVIEW', 'INFO_REQUESTED', 'APPROVED', 'REJECTED', 'DISPUTED', 'COMPLETED'], 
    default: 'PENDING',
    index: true
  },
  moderatorNotes: { type: String },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Claim', claimSchema);
