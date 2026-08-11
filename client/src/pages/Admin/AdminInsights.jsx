import React from 'react';
import { Lightbulb, TrendingUp, Target, MapPin } from 'lucide-react';

const AdminInsights = () => {
  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Recovery Insights</h1>
        <p className="mt-1 text-gray-500">AI-generated platform insights based on recent recovery patterns.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-8 rounded-3xl shadow-lg text-white">
          <Lightbulb className="mb-4 text-indigo-200" size={32} />
          <h3 className="text-xl font-bold mb-2">Campus Library is a hotspot</h3>
          <p className="text-indigo-100">Over 35% of all electronics reported lost were left at the Main Library. Consider adding a dedicated drop-box there.</p>
        </div>

        <div className="bg-white border border-gray-200 p-8 rounded-3xl shadow-sm">
          <Target className="mb-4 text-emerald-500" size={32} />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Fast Recovery Time</h3>
          <p className="text-gray-500">Items claimed within 24 hours of being found have a 92% successful verification rate. Encourage quick reporting.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminInsights;
