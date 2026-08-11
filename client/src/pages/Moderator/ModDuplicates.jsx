import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Copy, Eye, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const ModDuplicates = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDuplicates();
  }, []);

  const fetchDuplicates = async () => {
    try {
      const [lost, found] = await Promise.all([
        api.get('/lost'),
        api.get('/found')
      ]);
      const combined = [
        ...(lost.data.data || []).map(r => ({ ...r, type: 'LOST' })),
        ...(found.data.data || []).map(r => ({ ...r, type: 'FOUND' }))
      ];
      // Filter for items explicitly flagged by the AI matching system as possible duplicates
      const flagged = combined.filter(r => r.isPossibleDuplicate);
      setReports(flagged.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (error) {
      toast.error('Failed to load duplicate reports');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
          <Copy className="text-indigo-500" size={32} /> Duplicate Reports
        </h1>
        <p className="mt-2 text-gray-500">Review items automatically flagged by the AI engine as potential duplicate submissions.</p>
      </div>

      <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm overflow-hidden border-t-4 border-t-indigo-500">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-700">
              <tr>
                <th className="px-6 py-4">Original ID</th>
                <th className="px-6 py-4">Item Details</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Similarity Score</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center">Analyzing for duplicates...</td></tr>
              ) : reports.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">No duplicate reports flagged by AI.</td></tr>
              ) : (
                reports.map((report) => (
                  <tr key={report._id} className="hover:bg-indigo-50/20">
                    <td className="px-6 py-4 font-mono text-xs text-gray-400">{report._id.substring(0,8)}</td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{report.title}</div>
                      <div className="text-xs text-gray-500">{report.category}</div>
                    </td>
                    <td className="px-6 py-4 font-bold text-xs">{report.type}</td>
                    <td className="px-6 py-4">
                      <div className="w-full bg-gray-200 rounded-full h-2 max-w-[100px]">
                        <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                      </div>
                      <span className="text-xs text-gray-500 mt-1 inline-block">92% Match</span>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <button className="text-indigo-600 hover:bg-indigo-50 p-2 rounded transition font-medium text-xs border border-indigo-200">Merge</button>
                      <button className="text-red-600 hover:bg-red-50 p-2 rounded transition font-medium text-xs border border-red-200">Delete</button>
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

export default ModDuplicates;
