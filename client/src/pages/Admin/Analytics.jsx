import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { 
  PieChart, Pie, Cell, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, 
  LineChart, Line, ResponsiveContainer 
} from 'recharts';
import { TrendingUp, MapPin, Tag, Users, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
};

const Analytics = () => {
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
    <div className="flex justify-center items-center h-[50vh]">
      <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
    </div>
  );
  
  if (!stats) return <div className="p-8 text-center text-red-500 font-medium">Failed to load analytics data.</div>;

  // Format data for charts
  const categoryData = (stats.categories?.lost || []).map(item => ({ name: item._id, value: item.count }));
  const locationData = (stats.locations?.lost || []).slice(0, 5).map(item => ({ name: item._id, value: item.count }));
  const recoveryTrend = (stats.trends?.recoveryByMonth || []).map(item => ({ name: item._id, Recoveries: item.count }));

  // Generate Insights
  const totalLost = (stats.itemStats?.lost || []).reduce((acc, curr) => acc + curr.count, 0);
  const topCat = stats.categories?.mostFrequentLost || null;
  const topLoc = stats.locations?.mostCommonLost || null;
  
  const generateInsights = () => {
    const insights = [];
    if (topCat && totalLost > 0) {
      const percentage = Math.round((topCat.count / totalLost) * 100) || 0;
      insights.push(`"${topCat._id}" is the most frequently reported lost category, representing ${percentage}% of all lost items.`);
    }
    if (topLoc) {
      insights.push(`The highest volume of lost items occurs at "${topLoc._id}" with ${topLoc.count} reports.`);
    }
    if (recoveryTrend.length > 1) {
      const current = recoveryTrend[recoveryTrend.length - 1].Recoveries;
      const prev = recoveryTrend[recoveryTrend.length - 2].Recoveries;
      if (current > prev) {
        insights.push(`Recovery rates are trending up this month compared to last month.`);
      }
    }
    return insights;
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <motion.div variants={itemVariants} className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">System Analytics</h1>
        <p className="mt-2 text-sm text-gray-600">Live data aggregation from MongoDB</p>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { title: 'Total Users', value: stats.totals?.users || 0, icon: Users, color: 'indigo' },
          { title: 'Total Lost Items', value: totalLost, icon: Tag, color: 'rose' },
          { title: 'Top Category', value: topCat ? topCat._id : 'N/A', icon: TrendingUp, color: 'emerald' },
          { title: 'Top Hotspot', value: topLoc ? topLoc._id : 'N/A', icon: MapPin, color: 'amber' }
        ].map((card, idx) => (
          <motion.div whileHover={{ y: -5 }} key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-center space-x-4">
            <div className={`p-3 rounded-2xl bg-${card.color}-50 text-${card.color}-600`}><card.icon size={24} /></div>
            <div>
              <p className="text-sm font-medium text-gray-500">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900 truncate">{card.value}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Dynamic Insights */}
      <motion.div variants={itemVariants} className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100/50 rounded-2xl p-6 mb-8 shadow-sm">
        <h2 className="text-lg font-bold text-indigo-900 mb-4 flex items-center gap-2">
          <Zap size={20} className="text-indigo-600" /> Data-Driven Insights
        </h2>
        <ul className="space-y-3">
          {generateInsights().map((insight, idx) => (
            <motion.li 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + (idx * 0.2) }}
              key={idx} 
              className="flex items-start gap-3 text-indigo-800 bg-white/60 p-3 rounded-lg"
            >
              <span className="mt-0.5 text-indigo-500">•</span> {insight}
            </motion.li>
          ))}
          {generateInsights().length === 0 && <li className="text-indigo-600">Not enough data to generate insights yet.</li>}
        </ul>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pie Chart */}
        <motion.div whileHover={{ scale: 1.01 }} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Lost Items by Category</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value" label>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Bar Chart */}
        <motion.div whileHover={{ scale: 1.01 }} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Top 5 Lost Item Locations</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={locationData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} cursor={{ fill: '#f3f4f6' }} />
                <Bar dataKey="value" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Line Chart */}
        <motion.div whileHover={{ scale: 1.01 }} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm lg:col-span-2">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Recovery Trend (Monthly)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={recoveryTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="Recoveries" stroke="#10b981" strokeWidth={4} dot={{ r: 6, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Analytics;
