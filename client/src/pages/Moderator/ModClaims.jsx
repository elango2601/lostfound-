import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { ShieldCheck, Eye, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const ModClaims = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    try {
      const { data } = await api.get('/claims');
      // Mods primarily care about pending claims
      const pendingClaims = (data.data || []).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
      setClaims(pendingClaims);
    } catch (error) {
      toast.error('Failed to load claims');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateClaimStatus = async (id, status) => {
    try {
      await api.put(`/claims/${id}/status`, { status });
      toast.success(`Claim ${status.toLowerCase()}`);
      fetchClaims();
    } catch (error) {
      toast.error('Failed to update claim');
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
          <ShieldCheck className="text-orange-500" size={32} /> Claim Verification
        </h1>
        <p className="mt-2 text-gray-500">Review user-submitted proofs and approve or reject ownership claims.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-700">
              <tr>
                <th className="px-6 py-4">Claim ID</th>
                <th className="px-6 py-4">Item Type</th>
                <th className="px-6 py-4">Proof Details</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Filed</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="6" className="px-6 py-8 text-center">Loading claims...</td></tr>
              ) : claims.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-8 text-center">No claims require verification.</td></tr>
              ) : (
                claims.map((claim) => (
                  <tr key={claim._id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-mono text-xs">{claim._id.substring(0,8)}</td>
                    <td className="px-6 py-4 font-semibold">{claim.itemType}</td>
                    <td className="px-6 py-4 truncate max-w-[250px]">{claim.proofDescription}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded-md text-xs font-bold uppercase border ${
                        claim.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        claim.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-100' :
                        'bg-amber-50 text-amber-700 border-amber-100'
                      }`}>
                        {claim.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400">{new Date(claim.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      {claim.status === 'PENDING' && (
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleUpdateClaimStatus(claim._id, 'APPROVED')} className="text-emerald-600 hover:bg-emerald-50 p-1.5 rounded transition"><CheckCircle size={18} /></button>
                          <button onClick={() => handleUpdateClaimStatus(claim._id, 'REJECTED')} className="text-red-600 hover:bg-red-50 p-1.5 rounded transition"><XCircle size={18} /></button>
                        </div>
                      )}
                      {claim.status !== 'PENDING' && (
                        <button className="text-gray-400 hover:text-orange-600 transition p-2"><Eye size={18} /></button>
                      )}
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

export default ModClaims;
