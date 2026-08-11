import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { AlertTriangle, ShieldAlert, Eye, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const ModSuspicious = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSuspicious();
  }, []);

  const fetchSuspicious = async () => {
    try {
      const [lost, found] = await Promise.all([
        api.get('/lost'),
        api.get('/found')
      ]);
      // Filter reports that seem suspicious (e.g. lots of recent claims or marked by system)
      const combined = [
        ...(lost.data.data || []).map(r => ({ ...r, type: 'LOST' })),
        ...(found.data.data || []).map(r => ({ ...r, type: 'FOUND' }))
      ];
      // For demo purposes, we flag any with very short descriptions or generic titles
      const flagged = combined.filter(r => r.description?.length < 15 || r.title?.length < 5);
      setReports(flagged.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (error) {
      toast.error('Failed to load suspicious reports');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
          <ShieldAlert className="text-red-500" size={32} /> Suspicious Reports
        </h1>
        <p className="mt-2 text-gray-500">Monitor reports flagged by our security heuristic for potential fraud or spam.</p>
      </div>

      <div className="bg-white rounded-2xl border border-red-100 shadow-sm overflow-hidden border-t-4 border-t-red-500">
        <div className="p-4 border-b border-gray-100 bg-red-50/30 flex gap-4">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Search flagged items..." className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-700">
              <tr>
                <th className="px-6 py-4">Item Title</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Flag Reason</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center">Scanning for suspicious activity...</td></tr>
              ) : reports.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-emerald-600 font-medium">No suspicious reports detected!</td></tr>
              ) : (
                reports.map((report) => (
                  <tr key={report._id} className="hover:bg-red-50/20">
                    <td className="px-6 py-4 font-semibold text-gray-900">{report.title}</td>
                    <td className="px-6 py-4 font-bold text-xs">{report.type}</td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1 text-red-600 font-medium text-xs bg-red-50 px-2 py-1 rounded w-fit">
                        <AlertTriangle size={14} /> Vague Description / Title
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400">{new Date(report.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-gray-400 hover:text-red-600 transition p-2 bg-white border border-gray-200 rounded shadow-sm">Review</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ModSuspicious;
