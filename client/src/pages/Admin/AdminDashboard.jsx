import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Users, Activity, Archive, CheckCircle, TrendingUp, AlertTriangle, Clock, Database } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/admin/stats');
        setStats(data.data);
      } catch (error) {
        console.error('Error fetching admin stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
    </div>
  );

  if (!stats) return <div className="p-8 text-center text-red-500">Failed to load Command Center data.</div>;

  // Compute aggregated stats from the MongoDB pipeline results
  const totalUsers = stats.totals.users;
  const totalLost = stats.itemStats.lost.reduce((acc, curr) => acc + curr.count, 0);
  const totalFound = stats.itemStats.found.reduce((acc, curr) => acc + curr.count, 0);
  
  const recoveredLost = stats.itemStats.lost.find(s => ['CLAIMED', 'RECOVERED'].includes(s._id))?.count || 0;
  const recoveredFound = stats.itemStats.found.find(s => ['CLAIMED', 'RECOVERED', 'RETURNED'].includes(s._id))?.count || 0;
  const totalRecovered = recoveredLost + recoveredFound;
  
  const recoveryRate = totalLost > 0 ? Math.round((recoveredLost / totalLost) * 100) : 0;
  
  const pendingClaims = stats.claims.find(c => c._id === 'PENDING')?.count || 0;
  const potentialMatches = Math.floor(totalLost * 0.15); // Mock for now if not in DB
  const suspiciousReports = 0; // Mock for now

  const topStats = [
    { name: 'Total Users', value: totalUsers, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
    { name: 'Total Lost', value: totalLost, icon: Activity, color: 'text-rose-500', bg: 'bg-rose-50' },
    { name: 'Total Found', value: totalFound, icon: Archive, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { name: 'Total Recovered', value: totalRecovered, icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  ];

  const secondaryStats = [
    { name: 'Recovery Rate', value: `${recoveryRate}%`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { name: 'Pending Claims', value: pendingClaims, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
    { name: 'Potential Matches', value: potentialMatches, icon: Database, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { name: 'Suspicious Reports', value: suspiciousReports, icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50' },
  ];

  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Command Center</h1>
        <p className="mt-1 text-gray-500">Live platform metrics powered by MongoDB Aggregations.</p>
      </div>

      {/* Top Stat Row */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {topStats.map((stat, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={stat.name} 
            className="bg-white overflow-hidden shadow-sm rounded-2xl border border-gray-100 flex items-center p-6"
          >
            <div className={`p-4 rounded-xl ${stat.bg}`}>
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500 truncate">{stat.name}</p>
              <p className="mt-1 text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Second Stat Row */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {secondaryStats.map((stat, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + (idx * 0.1) }}
            key={stat.name} 
            className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100 px-6 py-5 flex justify-between items-center"
          >
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.name}</p>
              <p className={`mt-1 text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
            <div className={`p-2 rounded-lg ${stat.bg} opacity-80`}>
              <stat.icon size={20} className={stat.color} />
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Quick Insights Snippet */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 shadow-sm"
      >
        <h3 className="text-lg font-bold text-indigo-900 mb-2">Automated Insights</h3>
        <ul className="space-y-2 text-indigo-800/80">
          <li>• The most common category of lost items is <strong>{stats.categories.mostFrequentLost?._id || 'Unknown'}</strong>.</li>
          <li>• The location with the highest report rate is <strong>{stats.locations.mostCommonLost?._id || 'Unknown'}</strong>.</li>
          <li>• Platform activity suggests a {recoveryRate > 20 ? 'healthy' : 'developing'} recovery network.</li>
        </ul>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
