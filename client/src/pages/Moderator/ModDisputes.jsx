import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Scale, MessageCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const ModDisputes = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    try {
      const { data } = await api.get('/claims');
      // For demo, we consider rejected claims or claims on the same item as 'Disputes'
      const disputedClaims = (data.data || []).filter(c => c.status === 'REJECTED');
      setClaims(disputedClaims);
    } catch (error) {
      toast.error('Failed to load disputes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
          <Scale className="text-fuchsia-500" size={32} /> Dispute Resolution
        </h1>
        <p className="mt-2 text-gray-500">Resolve conflicts where multiple users claim ownership, or appeal rejected claims.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50 font-semibold text-gray-700">Active Dispute Cases</div>
          <div className="divide-y divide-gray-100">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading cases...</div>
            ) : claims.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No active disputes requiring resolution.</div>
            ) : (
              claims.map((claim) => (
                <div key={claim._id} className="p-6 hover:bg-gray-50/50 transition">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="inline-flex items-center gap-1 text-xs font-bold bg-fuchsia-100 text-fuchsia-700 px-2 py-1 rounded">
                        CASE: {claim._id.substring(0,8)}
                      </span>
                      <h3 className="font-bold text-gray-900 mt-2">Ownership Appeal: {claim.itemType}</h3>
                    </div>
                    <span className="text-sm text-gray-400 font-medium">{new Date(claim.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <span className="font-semibold block mb-1">Original Proof Submitted:</span>
                    {claim.proofDescription}
                  </p>
                  <div className="mt-4 flex gap-3">
                    <button className="flex-1 bg-fuchsia-600 text-white py-2 rounded-xl text-sm font-bold shadow hover:bg-fuchsia-700 transition">Contact User</button>
                    <button className="flex-1 bg-white border border-gray-200 text-gray-700 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-gray-50 transition">Overturn Decision</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 h-fit">
           <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><AlertCircle className="text-amber-500" size={18}/> Resolution Guidelines</h3>
           <ul className="text-sm text-gray-600 space-y-3">
             <li className="flex gap-2"><span>1.</span> Always request serial numbers or MAC addresses for electronics.</li>
             <li className="flex gap-2"><span>2.</span> For documents, verify government ID matching the document name.</li>
             <li className="flex gap-2"><span>3.</span> If two users claim the same item, hold the item and request in-person verification.</li>
           </ul>
        </div>
      </div>
    </div>
  );
};

export default ModDisputes;
