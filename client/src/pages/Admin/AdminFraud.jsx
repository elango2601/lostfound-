import React from 'react';
import { AlertTriangle, ShieldAlert, AlertCircle, RefreshCw } from 'lucide-react';

const AdminFraud = () => {
  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Fraud & Duplicates</h1>
          <p className="mt-1 text-gray-500">Monitor high-risk reports and automated duplicate detection.</p>
        </div>
        <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition">
          <RefreshCw size={18} /> Run Scan
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* High Risk Reports */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-rose-50/50 flex items-center gap-2">
            <ShieldAlert className="text-rose-600" size={20} />
            <h3 className="font-bold text-gray-900">High Risk Activity</h3>
          </div>
          <div className="p-8 text-center flex flex-col items-center">
            <AlertCircle size={40} className="text-gray-300 mb-3" />
            <p className="text-gray-500 text-sm">No high-risk activity detected.</p>
          </div>
        </div>

        {/* Duplicate Reports */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-amber-50/50 flex items-center gap-2">
            <AlertTriangle className="text-amber-600" size={20} />
            <h3 className="font-bold text-gray-900">Potential Duplicates</h3>
          </div>
          <div className="p-8 text-center flex flex-col items-center">
            <AlertCircle size={40} className="text-gray-300 mb-3" />
            <p className="text-gray-500 text-sm">No duplicates found in the current dataset.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminFraud;
