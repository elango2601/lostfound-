import React from 'react';
import { Building2, Plus, Users, LayoutDashboard } from 'lucide-react';

const AdminOrganizations = () => {
  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Organizations</h1>
          <p className="mt-1 text-gray-500">Scale support across enterprise networks and campuses.</p>
        </div>
        <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition">
          <Plus size={18} /> Add Organization
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Mock Organization Card to show extensibility */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4">
            <Building2 size={24} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-1">Global Tech Campus</h3>
          <p className="text-sm text-gray-500 mb-4">Enterprise tier • Active</p>
          
          <div className="flex items-center justify-between py-3 border-t border-gray-100 text-sm">
            <span className="text-gray-500 flex items-center gap-1.5"><Users size={16}/> Users</span>
            <span className="font-semibold text-gray-900">1,204</span>
          </div>
          <div className="flex items-center justify-between py-3 border-t border-gray-100 text-sm">
            <span className="text-gray-500 flex items-center gap-1.5"><LayoutDashboard size={16}/> Active Reports</span>
            <span className="font-semibold text-gray-900">45</span>
          </div>
          
          <button className="mt-4 w-full bg-gray-50 text-gray-700 font-medium py-2 rounded-lg hover:bg-gray-100 transition">
            Manage Organization
          </button>
        </div>

        {/* Empty placeholder for more */}
        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
          <Building2 size={32} className="text-gray-400 mb-2" />
          <p className="text-gray-500 font-medium mb-1">Ready to scale</p>
          <p className="text-sm text-gray-400">Onboard more organizations to partition data.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminOrganizations;
