import React, { useEffect, useState, useContext } from 'react';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { ArchiveRestore, CheckCircle, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const RecoveryHistory = () => {
  const { user, loading: authLoading } = useContext(AuthContext);
  const [recoveries, setRecoveries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user?._id) { setLoading(false); return; }
    const fetchRecoveries = async () => {
      try {
        const { data } = await api.get('/claims');
        // A recovered item is a claim that has been approved
        const approvedClaims = (data.data || []).filter(c => 
          (c.claimant?._id === user._id || c.claimant === user._id || c.claimantId?._id === user._id) 
          && c.status === 'APPROVED'
        );
        setRecoveries(approvedClaims);
      } catch (error) {
        toast.error('Failed to load recovery history');
      } finally {
        setLoading(false);
      }
    };
    if (!authLoading && user?._id) fetchRecoveries();
  }, [user, authLoading]);

  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
          <ArchiveRestore className="text-emerald-500" size={32} /> Recovery History
        </h1>
        <p className="mt-2 text-gray-500">Celebrate the items you've successfully claimed and recovered.</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-[40vh]">
          <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        <AnimatePresence>
          {recoveries.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-gray-200 rounded-2xl p-16 text-center shadow-sm"
            >
              <Package className="mx-auto h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-xl font-medium text-gray-900">No recovered items yet</h3>
              <p className="mt-2 text-gray-500 max-w-sm mx-auto">When your item claims are approved by a moderator, they will appear here as successful recoveries.</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recoveries.map((recovery, idx) => (
                <motion.div
                  key={recovery._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col"
                >
                  <div className="h-2 w-full bg-emerald-500"></div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wide">
                        <CheckCircle size={14} /> Recovered
                      </span>
                      <span className="text-xs font-mono text-gray-400">ID: {recovery._id.substring(0, 8)}</span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{recovery.itemType === 'LostItem' ? 'Lost Item' : 'Found Item'}</h3>
                    <p className="text-sm text-gray-500 mb-6">Linked Item ID: {recovery.itemId}</p>
                    
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Your Proof Provided</p>
                      <p className="text-sm text-gray-700 italic">"{recovery.proofDescription || recovery.description}"</p>
                    </div>
                  </div>
                  <div className="mt-auto bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-between items-center text-sm">
                    <span className="text-gray-500 font-medium">Claim Approved On</span>
                    <span className="text-gray-900 font-bold">{new Date(recovery.updatedAt || recovery.createdAt).toLocaleDateString()}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

export default RecoveryHistory;
