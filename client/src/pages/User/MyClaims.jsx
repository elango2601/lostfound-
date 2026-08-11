import React, { useEffect, useState, useContext } from 'react';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { FileCheck, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

const MyClaims = () => {
  const { user, loading: authLoading } = useContext(AuthContext);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user?._id) { setLoading(false); return; }
    const fetchClaims = async () => {
      try {
        const { data } = await api.get('/claims');
        // Filter claims belonging to current user
        const userClaims = (data.data || []).filter(c => c.claimant?._id === user._id || c.claimant === user._id);
        setClaims(userClaims);
      } catch (error) {
        toast.error('Failed to load your claims');
      } finally {
        setLoading(false);
      }
    };
    if (!authLoading && user?._id) fetchClaims();
  }, [user, authLoading]);

  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
          <FileCheck className="text-emerald-500" size={32} /> My Claims
        </h1>
        <p className="mt-2 text-gray-500">Track the status of ownership claims you've submitted.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-700 font-semibold">
              <tr>
                <th className="px-6 py-4">Claim ID</th>
                <th className="px-6 py-4">Item ID</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date Filed</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="6" className="px-6 py-8 text-center">Loading your claims...</td></tr>
              ) : claims.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-8 text-center">You haven't filed any claims yet.</td></tr>
              ) : (
                claims.map((claim) => (
                  <tr key={claim._id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-mono text-xs text-gray-400">{claim._id.substring(0,8)}</td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">{claim.itemId}</td>
                    <td className="px-6 py-4 font-semibold text-gray-900">{claim.itemType}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded-md text-xs font-bold uppercase border ${
                        claim.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        claim.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-100' :
                        'bg-amber-50 text-amber-700 border-amber-100'
                      }`}>
                        {claim.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">{new Date(claim.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-gray-400 hover:text-indigo-600 transition p-2"><Eye size={18} /></button>
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

export default MyClaims;
