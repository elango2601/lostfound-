import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { User, Mail, Shield, Key } from 'lucide-react';

const Profile = () => {
  const { user } = useContext(AuthContext);

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Your Profile</h1>
        <p className="mt-1 text-gray-500">Manage your account settings and preferences.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side Profile Card */}
        <div className="bg-gray-50 p-8 border-b md:border-b-0 md:border-r border-gray-200 flex flex-col items-center justify-center min-w-[300px]">
          <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-3xl mb-4 shadow-sm border-4 border-white">
            {user.name.charAt(0)}
          </div>
          <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
          <span className={`mt-2 px-3 py-1 rounded-full text-xs font-bold uppercase ${
            user.role === 'admin' ? 'bg-indigo-100 text-indigo-700' :
            user.role === 'moderator' ? 'bg-orange-100 text-orange-700' :
            'bg-gray-200 text-gray-700'
          }`}>
            {user.role} Role
          </span>
        </div>

        {/* Right Side Details Form */}
        <div className="flex-1 p-8">
          <form className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  disabled
                  defaultValue={user.name} 
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="email" 
                  disabled
                  defaultValue={user.email} 
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Account ID</label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  disabled
                  defaultValue={user.id || user._id} 
                  className="w-full pl-10 pr-4 py-2 font-mono text-xs bg-gray-50 border border-gray-200 rounded-xl text-gray-400 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <button type="button" disabled className="px-6 py-2 bg-indigo-500 text-white rounded-xl font-medium opacity-50 cursor-not-allowed">
                Save Changes
              </button>
              <button type="button" className="px-6 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition">
                Change Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
