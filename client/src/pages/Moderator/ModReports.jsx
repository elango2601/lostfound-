import React, { useEffect, useState, useContext } from 'react';
import api from '../../services/api';
import { Search, Filter, Eye, AlertCircle, ShieldCheck, X, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { SocketContext } from '../../context/SocketContext';

const ModReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const socket = useContext(SocketContext);
  
  // Modal State
  const [selectedReport, setSelectedReport] = useState(null);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    fetchReports();
  }, [page]);

  // Real-time: listen for new claims and status updates
  useEffect(() => {
    if (!socket) return;

    setIsLive(true);

    const handleNewClaim = () => {
      toast('📋 New claim received!', { icon: '🔔', duration: 4000 });
      fetchReports();
    };
    const handleStatusUpdated = (data) => {
      toast(`🔄 Claim ${data.status === 'APPROVED' ? 'approved ✅' : 'rejected ❌'}`, { duration: 3000 });
      fetchReports();
    };

    socket.on('new_claim', handleNewClaim);
    socket.on('claim_status_updated', handleStatusUpdated);

    return () => {
      socket.off('new_claim', handleNewClaim);
      socket.off('claim_status_updated', handleStatusUpdated);
      setIsLive(false);
    };
  }, [socket]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [lost, found] = await Promise.all([
        api.get(`/lost?page=${page}&limit=10`),
        api.get(`/found?page=${page}&limit=10`)
      ]);
      
      const maxPages = Math.max(lost.data.pages || 1, found.data.pages || 1);
      setTotalPages(maxPages);

      const combined = [
        ...(lost.data.data || []).map(r => ({ ...r, type: 'LOST' })),
        ...(found.data.data || []).map(r => ({ ...r, type: 'FOUND' }))
      ];
      setReports(combined.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (error) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, type, status) => {
    try {
      const endpoint = type === 'LOST' ? `/lost/${id}` : `/found/${id}`;
      await api.put(endpoint, { status });
      toast.success('Status updated');
      fetchReports();
      if (selectedReport && selectedReport._id === id) {
        setSelectedReport({ ...selectedReport, status });
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 relative">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
          <ShieldCheck className="text-orange-500" size={32} /> Report Moderation
        </h1>
        <p className="mt-2 text-gray-500">Review and moderate user-submitted reports for accuracy and compliance.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex gap-4">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Search reports..." className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-700">
              <tr>
                <th className="px-6 py-4">Item Details</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Risk Flag</th>
                <th className="px-6 py-4">AI Trust</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="7" className="px-6 py-8 text-center">Loading reports...</td></tr>
              ) : reports.length === 0 ? (
                <tr><td colSpan="7" className="px-6 py-8 text-center">No reports to moderate.</td></tr>
              ) : (
                reports.map((report) => (
                  <tr key={report._id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{report.title}</div>
                      <div className="text-xs text-gray-500">{report.location}</div>
                    </td>
                    <td className="px-6 py-4 font-bold">{report.type}</td>
                    <td className="px-6 py-4 text-gray-500">{new Date(report.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      {report.isPossibleDuplicate ? (
                        <span className="flex items-center gap-1 text-amber-600 text-xs font-bold"><AlertCircle size={14}/> DUPLICATE</span>
                      ) : (
                        <span className="text-gray-400 text-xs">NONE</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {report.trustScore < 80 ? (
                        <div className="flex flex-col gap-1">
                          <span className="text-rose-600 text-xs font-bold">{report.trustScore}/100</span>
                          {report.fraudFlags?.map((flag, idx) => (
                             <span key={idx} className="text-[10px] text-rose-500 leading-tight block truncate max-w-[150px]" title={flag}>• {flag}</span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-emerald-600 text-xs font-bold">{report.trustScore}/100</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                       <select 
                          className="bg-gray-50 border border-gray-200 text-xs font-bold rounded-md px-2 py-1 outline-none focus:ring-1 focus:ring-orange-500"
                          value={report.status}
                          onChange={(e) => handleUpdateStatus(report._id, report.type, e.target.value)}
                        >
                          <option value={report.type === 'LOST' ? 'LOST' : 'FOUND'}>OPEN</option>
                          <option value="MATCHED">MATCHED</option>
                          <option value="CLOSED">CLOSED</option>
                       </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedReport(report)}
                        className="text-gray-400 hover:text-orange-600 transition p-2"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="p-4 border-t border-gray-200 flex justify-between items-center bg-gray-50 text-sm text-gray-500 rounded-b-2xl">
          <div>Page {page} of {totalPages}</div>
          <div className="flex gap-2">
            <button 
              disabled={page === 1} 
              onClick={() => setPage(p => p - 1)}
              className="px-4 py-1.5 border border-gray-200 rounded-lg hover:bg-white disabled:opacity-50 transition">Previous</button>
            <button 
              disabled={page >= totalPages} 
              onClick={() => setPage(p => p + 1)}
              className="px-4 py-1.5 border border-gray-200 rounded-lg hover:bg-white disabled:opacity-50 transition">Next</button>
          </div>
        </div>
      </div>

      {/* View Details Modal */}
      <AnimatePresence>
        {selectedReport && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedReport(null)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            ></motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-2xl relative z-10 max-h-[90vh] flex flex-col"
            >
              <button 
                onClick={() => setSelectedReport(null)}
                className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 transition-colors z-20"
              >
                <X size={20} />
              </button>

              <div className="overflow-y-auto p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${selectedReport.type === 'LOST' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>
                      {selectedReport.type} REPORT
                    </span>
                    <span className="text-sm text-gray-500 font-medium">{new Date(selectedReport.createdAt).toLocaleDateString()}</span>
                  </div>
                  
                  {selectedReport.trustScore < 80 && (
                     <span className="flex items-center gap-1 text-rose-600 text-xs font-bold bg-rose-50 px-2 py-1 rounded-md">
                        <AlertCircle size={14}/> LOW TRUST ({selectedReport.trustScore}/100)
                     </span>
                  )}
                </div>

                <h2 className="text-3xl font-bold text-gray-900 mb-4">{selectedReport.title}</h2>
                
                {selectedReport.imageUrl && (
                  <div className="w-full h-64 bg-gray-100 rounded-2xl overflow-hidden mb-6 border border-gray-200">
                    <img src={selectedReport.imageUrl} alt={selectedReport.title} className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="prose prose-orange text-gray-600 mb-8">
                  <p>{selectedReport.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100 mb-8">
                  <div>
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Category</span>
                    <span className="text-gray-900 font-medium">{selectedReport.category}</span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Location</span>
                    <span className="text-gray-900 font-medium flex items-center gap-1"><MapPin size={14} className="text-gray-400"/> {selectedReport.location}</span>
                  </div>
                  {selectedReport.brand && (
                    <div>
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Brand</span>
                      <span className="text-gray-900 font-medium">{selectedReport.brand}</span>
                    </div>
                  )}
                  {selectedReport.color && (
                    <div>
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Color</span>
                      <span className="text-gray-900 font-medium">{selectedReport.color}</span>
                    </div>
                  )}
                </div>

                {/* AI Trust Diagnostics */}
                {selectedReport.trustScore < 100 && (
                  <div className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl">
                    <h4 className="text-sm font-bold text-rose-900 mb-2 flex items-center gap-2">
                      <ShieldCheck size={16} /> AI Fraud Detection Flags
                    </h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-rose-700">
                      {selectedReport.fraudFlags?.map((flag, idx) => (
                        <li key={idx}>{flag}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-sm text-gray-500 font-medium">Update Report Status:</span>
                  <select 
                    className="bg-white border border-gray-300 text-sm font-bold text-gray-700 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-orange-500 shadow-sm"
                    value={selectedReport.status}
                    onChange={(e) => handleUpdateStatus(selectedReport._id, selectedReport.type, e.target.value)}
                  >
                    <option value={selectedReport.type === 'LOST' ? 'LOST' : 'FOUND'}>OPEN</option>
                    <option value="MATCHED">MATCHED</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default ModReports;
