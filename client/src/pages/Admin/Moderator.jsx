import React, { useEffect, useState, useContext } from 'react';
import api from '../../services/api';
import { CheckCircle, XCircle, Clock, ShieldCheck, AlertCircle, Wifi } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { SocketContext } from '../../context/SocketContext';

const Moderator = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const socket = useContext(SocketContext);

  useEffect(() => {
    fetchPendingClaims();
  }, []);

  // Real-time WebSocket listeners
  useEffect(() => {
    if (!socket) return;

    setIsLive(true);

    const handleNewClaim = () => {
      toast('📋 New claim submitted in queue!', { icon: '🔔', duration: 4000 });
      fetchPendingClaims();
    };

    const handleStatusUpdated = (data) => {
      // If a claim gets approved/rejected (even by another moderator), remove it from the pending list
      setClaims(prev => prev.filter(c => c._id !== data.claimId));
    };

    socket.on('new_claim', handleNewClaim);
    socket.on('claim_status_updated', handleStatusUpdated);

    return () => {
      socket.off('new_claim', handleNewClaim);
      socket.off('claim_status_updated', handleStatusUpdated);
      setIsLive(false);
    };
  }, [socket]);

  const fetchPendingClaims = async () => {
    try {
      const { data } = await api.get('/claims');
      const pending = (data.data || []).filter(c => c.status === 'PENDING');
      setClaims(pending);
    } catch (error) {
      toast.error('Failed to load claims queue');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    if (!window.confirm(`Are you sure you want to ${action === 'approve' ? 'APPROVE' : 'REJECT'} this claim?`)) {
      return;
    }
    try {
      // Optimistically remove from list first
      setClaims(prev => prev.filter(c => c._id !== id));
      await api.put(`/claims/${id}/status`, { status: action === 'approve' ? 'APPROVED' : 'REJECTED' });
      toast.success(`Claim ${action}d successfully`);
    } catch (error) {
      toast.error(`Failed to ${action} claim`);
      fetchPendingClaims(); // Revert back on error
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="text-orange-500" size={32} /> Moderator Queue
          </h1>
          <p className="mt-2 text-sm text-gray-600">Review and verify ownership claims to ensure secure recovery.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${isLive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
            <Wifi size={14} />
            {isLive ? 'LIVE' : 'Connecting...'}
            {isLive && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>}
          </div>
          <div className="bg-orange-50 px-4 py-2 rounded-lg border border-orange-100 flex items-center gap-2">
            <Clock className="text-orange-500" size={20} />
            <span className="font-semibold text-orange-700">{claims.length} Pending</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {claims.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center"
            >
              <CheckCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">You're all caught up!</h3>
              <p className="mt-1 text-gray-500">There are no pending claims in the queue right now.</p>
            </motion.div>
          ) : (
            claims.map((claim, idx) => (
              <motion.div
                key={claim._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100, transition: { duration: 0.2 } }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center justify-between hover:shadow-md transition-shadow"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                      {claim.itemType}
                    </span>
                    <span className="text-sm text-gray-500">Claim ID: {claim._id.slice(-6)}</span>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <h4 className="font-semibold text-gray-900 mb-2">Claimant Proof</h4>
                    <p className="text-sm text-gray-700 italic border-l-2 border-orange-300 pl-3">"{claim.description}"</p>
                  </div>
                </div>

                <div className="flex w-full md:w-auto flex-row gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleAction(claim._id, 'reject')}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border border-rose-200 text-rose-600 px-6 py-2.5 rounded-xl font-medium hover:bg-rose-50 hover:border-rose-300 transition-all"
                  >
                    <XCircle size={18} /> Reject
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleAction(claim._id, 'approve')}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-emerald-700 shadow-sm hover:shadow-emerald-500/30 transition-all"
                  >
                    <CheckCircle size={18} /> Approve
                  </motion.button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Moderator;
