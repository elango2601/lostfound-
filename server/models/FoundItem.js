const mongoose = require('mongoose');

const foundItemSchema = new mongoose.Schema({
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, index: true },
  category: { type: String, required: true, index: true },
  description: { type: String, required: true },
  brand: { type: String },
  color: { type: String },
  imageUrl: { type: String },
  location: { type: String, required: true, index: true },
  lat: { type: Number },
  lng: { type: Number },
  dateFound: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['FOUND', 'MATCHED', 'CLAIMED', 'RETURNED', 'CLOSED'], 
    default: 'FOUND',
    index: true 
  },
  isPossibleDuplicate: { type: Boolean, default: false },
  trustScore: { type: Number, default: 100 },
  fraudFlags: [{ type: String }]
}, { timestamps: true });

// Compound text index for free-text search across multiple fields
foundItemSchema.index({ title: 'text', description: 'text', brand: 'text', color: 'text', location: 'text' });

module.exports = mongoose.model('FoundItem', foundItemSchema);
