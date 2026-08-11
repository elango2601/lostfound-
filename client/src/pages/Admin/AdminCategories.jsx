import React from 'react';
import { Tag, Plus, Edit2, Trash2 } from 'lucide-react';

const AdminCategories = () => {
  const categories = ['Electronics', 'Documents', 'Wallets', 'Keys', 'Bags', 'Clothing', 'Books', 'Jewellery', 'Others'];

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Category Management</h1>
          <p className="mt-1 text-gray-500">Manage item classification categories.</p>
        </div>
        <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition">
          <Plus size={18} /> Add Category
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <ul className="divide-y divide-gray-100">
          {categories.map((cat, idx) => (
            <li key={idx} className="flex justify-between items-center px-6 py-4 hover:bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500">
                  <Tag size={18} />
                </div>
                <span className="font-medium text-gray-900">{cat}</span>
              </div>
              <div className="flex items-center gap-2">
                <button className="text-gray-400 hover:text-indigo-600 p-2"><Edit2 size={16}/></button>
                <button className="text-gray-400 hover:text-rose-600 p-2"><Trash2 size={16}/></button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AdminCategories;
