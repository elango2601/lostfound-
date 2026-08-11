import React, { useEffect, useState, useContext } from 'react';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { Inbox, Activity, Archive, MapPin, Calendar, Eye, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const MyReports = () => {
  const { user, loading: authLoading } = useContext(AuthContext);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // ALL, LOST, FOUND
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (authLoading) return;
    if (!user?._id) { setLoading(false); return; }
    const fetchMyReports = async () => {
      setLoading(true);
      try {
        const [lost, found] = await Promise.all([
          api.get(`/lost?reportedBy=${user._id}&page=${page}&limit=10`),
          api.get(`/found?reportedBy=${user._id}&page=${page}&limit=10`)
        ]);
        
        const maxPages = Math.max(lost.data.pages || 1, found.data.pages || 1);
        setTotalPages(maxPages);

        const combined = [
          ...(lost.data.data || []).map(r => ({ ...r, type: 'LOST' })),
          ...(found.data.data || []).map(r => ({ ...r, type: 'FOUND' }))
        ];
        setReports(combined.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)));
      } catch (error) {
        toast.error('Failed to load your reports');
      } finally {
        setLoading(false);
      }
    };
    if (!authLoading && user?._id) fetchMyReports();
  }, [user, page, authLoading]);

  const handleDelete = async (id, type) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    try {
      const endpoint = type === 'LOST' ? `/lost/${id}` : `/found/${id}`;
      await api.delete(endpoint);
      setReports(reports.filter(r => r._id !== id));
      toast.success('Report deleted successfully');
    } catch (error) {
      toast.error('Failed to delete report');
    }
  };

  const filteredReports = filter === 'ALL' ? reports : reports.filter(r => r.type === filter);

  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
          <Inbox className="text-indigo-600" size={32} /> My Reports
        </h1>
        <p className="mt-2 text-gray-500">Manage items you have reported lost or found on the platform.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        {/* Filter Bar */}
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <div className="flex bg-white rounded-xl border border-gray-200 p-1">
            {['ALL', 'LOST', 'FOUND'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${filter === f ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
              >
                {f} Reports
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-700 font-semibold">
              <tr>
                <th className="px-6 py-4">Item Details</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Location & Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center">Loading your reports...</td></tr>
              ) : filteredReports.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center">You haven't made any {filter !== 'ALL' ? filter.toLowerCase() : ''} reports yet.</td></tr>
              ) : (
                filteredReports.map((report) => (
                  <tr key={report._id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{report.title}</div>
                      <div className="text-xs text-gray-500">{report.category}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase ${report.type === 'LOST' ? 'bg-rose-50 text-rose-700' : 'bg-indigo-50 text-indigo-700'}`}>
                        {report.type === 'LOST' ? <Activity size={12}/> : <Archive size={12}/>} {report.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-gray-900"><MapPin size={14} className="text-gray-400"/> {report.location}</div>
                      <div className="flex items-center gap-1 text-gray-500 text-xs mt-1"><Calendar size={14} className="text-gray-400"/> {new Date(report.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-700">{report.status || 'OPEN'}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-gray-400 hover:text-indigo-600 transition p-2"><Eye size={18} /></button>
                      <button onClick={() => handleDelete(report._id, report.type)} className="text-gray-400 hover:text-red-600 transition p-2"><Trash2 size={18} /></button>
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
    </div>
  );
};

export default MyReports;
