import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { CheckCircle, XCircle, Clock, ShieldCheck, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const Moderator = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingClaims();
  }, []);

  const fetchPendingClaims = async () => {
    try {
      // For demo, we just fetch all claims and filter frontend, but ideally we query by status
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
    try {
      await api.put(`/claims/${id}/status`, { status: action === 'approve' ? 'APPROVED' : 'REJECTED' });
      toast.success(`Claim ${action}d successfully`);
      setClaims(claims.filter(c => c._id !== id));
    } catch (error) {
      toast.error(`Failed to ${action} claim`);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="text-orange-500" size={32} /> Moderator Queue
          </h1>
          <p className="mt-2 text-sm text-gray-600">Review and verify ownership claims to ensure secure recovery.</p>
        </div>
        <div className="bg-orange-50 px-4 py-2 rounded-lg border border-orange-100 flex items-center gap-2">
          <Clock className="text-orange-500" size={20} />
          <span className="font-semibold text-orange-700">{claims.length} Pending</span>
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
                    <p className="text-sm text-gray-700 italic border-l-2 border-orange-300 pl-3">"{claim.proofDescription}"</p>
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
