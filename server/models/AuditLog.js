const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true },
  previousStatus: { type: String },
  newStatus: { type: String }
}, { 
  timestamps: { createdAt: 'timestamp', updatedAt: false } 
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
