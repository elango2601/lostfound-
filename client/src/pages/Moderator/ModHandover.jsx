import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { PackageOpen, MapPin, CheckSquare, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const ModHandover = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHandoverQueue();
  }, []);

  const fetchHandoverQueue = async () => {
    try {
      const { data } = await api.get('/claims');
      // Handovers are for APPROVED claims that haven't been physically picked up yet
      const approvedClaims = (data.data || []).filter(c => c.status === 'APPROVED');
      setClaims(approvedClaims);
    } catch (error) {
      toast.error('Failed to load handover queue');
    } finally {
      setLoading(false);
    }
  };

  const completeHandover = async (id) => {
    toast.success('Item physically handed over successfully!');
    setClaims(claims.filter(c => c._id !== id));
    // In a real app, this would hit an API to change the claim/item status to RETURNED/CLOSED
  };

  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
          <PackageOpen className="text-blue-500" size={32} /> Physical Handover
        </h1>
        <p className="mt-2 text-gray-500">Manage the logistics of returning verified items back to their rightful owners in person.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
           <div className="col-span-full text-center text-gray-500 py-10">Loading pickup queue...</div>
        ) : claims.length === 0 ? (
           <div className="col-span-full bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center text-gray-500">
             No pending handovers scheduled.
           </div>
        ) : (
          claims.map(claim => (
            <div key={claim._id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
               <div className="p-4 bg-blue-50 border-b border-blue-100 flex justify-between items-center">
                 <span className="font-bold text-blue-900 text-sm">Pickup Ready</span>
                 <span className="text-xs text-blue-600 font-medium flex items-center gap-1"><Clock size={12}/> Waiting</span>
               </div>
               <div className="p-6 flex-1">
                 <h3 className="font-bold text-gray-900 text-lg mb-1">{claim.itemType}</h3>
                 <p className="text-sm text-gray-500 font-mono mb-4">Claim: {claim._id.substring(0,10)}</p>
                 
                 <div className="space-y-3">
                   <div className="flex items-center gap-3 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">
                     <MapPin className="text-blue-400" size={16} />
                     <div>
                       <span className="block font-medium">Pickup Location</span>
                       <span className="text-gray-500 text-xs">Security Desk - Main Lobby</span>
                     </div>
                   </div>
                 </div>
               </div>
               <div className="p-4 border-t border-gray-100">
                 <button onClick={() => completeHandover(claim._id)} className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl shadow-md hover:bg-gray-800 transition flex items-center justify-center gap-2">
                   <CheckSquare size={18} /> Confirm Handover
                 </button>
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ModHandover;
