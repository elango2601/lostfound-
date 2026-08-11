import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Clock, Search, User } from 'lucide-react';

const AdminAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const { data } = await api.get('/admin/activity-logs');
      setLogs(data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Audit Logs</h1>
        <p className="mt-1 text-gray-500">Immutable record of all moderator and admin actions.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-700">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Actor</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="4" className="px-6 py-8 text-center">Loading logs...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan="4" className="px-6 py-8 text-center">No activity logs recorded yet.</td></tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-mono text-xs">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="px-6 py-4 flex items-center gap-2">
                      <User size={14} className="text-gray-400" />
                      <span className="font-medium text-gray-900">{log.actorId?.name || 'System'}</span>
                    </td>
                    <td className="px-6 py-4"><span className="bg-gray-100 px-2 py-1 rounded font-mono text-xs text-gray-700">{log.action}</span></td>
                    <td className="px-6 py-4 truncate max-w-xs">{log.details}</td>
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

export default AdminAuditLogs;
