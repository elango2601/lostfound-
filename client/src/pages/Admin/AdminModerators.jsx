import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Shield, ShieldCheck, UserPlus, MoreVertical, Search, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminModerators = () => {
  const [moderators, setModerators] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMods = async () => {
      try {
        const { data } = await api.get('/admin/users');
        const mods = (data.data || []).filter(u => u.role === 'moderator' || u.role === 'admin');
        setModerators(mods);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchMods();
  }, []);

  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Moderator Team</h1>
          <p className="mt-1 text-gray-500">Manage the trust and safety team.</p>
        </div>
        <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition">
          <UserPlus size={18} /> Add Moderator
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading team...</div>
        ) : moderators.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <AlertCircle size={48} className="text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">No moderators found in the system.</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-700">
              <tr>
                <th className="px-6 py-4">Moderator</th>
                <th className="px-6 py-4">Role Status</th>
                <th className="px-6 py-4">Performance (Mock)</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {moderators.map((mod, idx) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={mod._id} className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold">
                        {mod.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{mod.name}</div>
                        <div className="text-xs text-gray-500">{mod.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-md text-xs font-bold uppercase bg-orange-50 text-orange-700 border border-orange-100">
                      {mod.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-gray-500">
                      Reports: <span className="font-semibold text-gray-900">142</span> | Claims: <span className="font-semibold text-gray-900">38</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-gray-400 hover:text-indigo-600 transition p-2">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminModerators;
