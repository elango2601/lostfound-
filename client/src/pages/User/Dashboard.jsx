import React, { useEffect, useState, useContext } from 'react';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { Activity, Archive, CheckCircle, Clock, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

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

const Dashboard = () => {
  const { user, loading: authLoading } = useContext(AuthContext);
  const [stats, setStats] = useState({
    lost: 0,
    found: 0,
    claims: 0,
    recovered: 0
  });
  const [potentialMatches, setPotentialMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait for auth to resolve
    if (authLoading) return;
    // Auth done but no user — stop spinner immediately
    if (!user?._id) { setLoading(false); return; }

    const fetchDashboardData = async () => {
      try {
        const [lostRes, foundRes, claimsRes] = await Promise.all([
          api.get(`/lost?reportedBy=${user._id}`),
          api.get(`/found?reportedBy=${user._id}`),
          api.get(`/claims`)
        ]);

        const lostItems = lostRes.data.data || [];
        const foundItems = foundRes.data.data || [];
        
        const recoveredCount = lostItems.filter(item => ['CLAIMED', 'RECOVERED'].includes(item.status)).length;

        setStats({
          lost: lostItems.length,
          found: foundItems.length,
          claims: claimsRes.data.data ? claimsRes.data.data.length : 0,
          recovered: recoveredCount
        });

        // Fetch matches for OPEN lost items
        let allMatches = [];
        for (const lostItem of lostItems) {
           if (lostItem.status === 'OPEN') {
               try {
                   const matchRes = await api.get(`/lost/${lostItem._id}/matches`);
                   const matches = matchRes.data.data || [];
                   matches.forEach(m => {
                     m.originalLostItemId = lostItem._id;
                     m.originalLostItemTitle = lostItem.title;
                   });
                   allMatches = [...allMatches, ...matches];
               } catch (e) {
                   console.error("Failed to fetch matches");
               }
           }
        }
        allMatches.sort((a,b) => b.score - a.score);
        setPotentialMatches(allMatches.slice(0, 3));

      } catch (error) {
        console.error('Error fetching dashboard stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [user, authLoading]);

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
    </div>
  );

  const statCards = [
    { name: 'My Lost Reports', value: stats.lost, icon: Activity, color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-100', link: '/my-reports?type=lost' },
    { name: 'My Found Reports', value: stats.found, icon: Archive, color: 'text-indigo-500', bg: 'bg-indigo-50', border: 'border-indigo-100', link: '/my-reports?type=found' },
    { name: 'Active Claims', value: stats.claims, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100', link: '/my-claims' },
    { name: 'Successfully Recovered', value: stats.recovered, icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100', link: '/my-reports?status=recovered' },
  ];

  return (
    <motion.div 
      variants={containerVariants} 
      initial="hidden" 
      animate="visible" 
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
    >
      <motion.div variants={itemVariants} className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome back, {user.name}</h1>
        <p className="mt-1 text-gray-500">Here's an overview of your activity on LostFound+</p>
      </motion.div>
      
      <motion.div variants={itemVariants} className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <motion.div 
            whileHover={{ y: -5, scale: 1.02 }}
            key={stat.name} 
            className={`bg-white overflow-hidden shadow-sm hover:shadow-lg transition-all rounded-2xl border ${stat.border} flex flex-col`}
          >
            <div className="p-6 flex-grow">
              <div className="flex items-center">
                <div className={`flex-shrink-0 p-3 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                    <dd className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50/80 border-t border-gray-100 px-6 py-3">
              <Link to={stat.link} className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-900 group">
                View details <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Content Split */}
      <motion.div variants={itemVariants} className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Lists) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Active Lost Reports */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2"><Activity size={20} className="text-rose-500"/> Active Lost Reports</h3>
              <Link to="/my-reports?type=lost" className="text-sm font-medium text-indigo-600 hover:text-indigo-800">View all</Link>
            </div>
            <div className="divide-y divide-gray-100">
              {stats.lost === 0 ? (
                <div className="p-8 text-center text-gray-500 text-sm">No active lost reports.</div>
              ) : (
                <div className="p-8 text-center text-gray-500 text-sm italic">Items list will be rendered here. Fetching detailed reports from API.</div>
              )}
            </div>
          </div>

          {/* Recent Found Items */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2"><Archive size={20} className="text-indigo-500"/> Recent Found Items</h3>
              <Link to="/my-reports?type=found" className="text-sm font-medium text-indigo-600 hover:text-indigo-800">View all</Link>
            </div>
            <div className="divide-y divide-gray-100">
              {stats.found === 0 ? (
                <div className="p-8 text-center text-gray-500 text-sm">No recent found items reported.</div>
              ) : (
                <div className="p-8 text-center text-gray-500 text-sm italic">Items list will be rendered here. Fetching detailed reports from API.</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (Sidebar components) */}
        <div className="space-y-8">
          
          {/* CTA Box */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl shadow-lg border border-indigo-400 p-8 text-center relative overflow-hidden text-white">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
            <h3 className="text-xl font-bold mb-2">Need to report?</h3>
            <p className="text-indigo-100 text-sm mb-6">Our matching engine works 24/7 to connect lost items with finders.</p>
            <div className="flex flex-col gap-3">
              <Link to="/report-lost" className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors shadow-sm">Report Lost Item</Link>
              <Link to="/report-found" className="bg-indigo-700/50 border border-indigo-400/50 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700/70 transition-colors">Report Found Item</Link>
            </div>
          </div>

          {/* Notifications / Matches snippet */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2"><CheckCircle size={20} className="text-emerald-500"/> AI Matches</h3>
              <Link to="/search" className="text-sm text-indigo-600 font-medium hover:text-indigo-800">Search DB</Link>
            </div>
            <div className="p-0">
              {potentialMatches.length === 0 ? (
                 <div className="p-6 text-center text-gray-500 text-sm">No new matches found today. We'll notify you if something comes up!</div>
              ) : (
                 <div className="divide-y divide-gray-100">
                    {potentialMatches.map((match, idx) => (
                       <div key={idx} className="p-4 hover:bg-gray-50 transition">
                          <div className="flex justify-between items-start mb-1">
                             <span className="font-bold text-gray-900 text-sm truncate max-w-[150px]">{match.item.title}</span>
                             <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${match.matchLabel === 'Strong Match' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{match.matchLabel}</span>
                          </div>
                          <p className="text-xs text-gray-500 mb-2">Matched against your: <span className="font-medium text-gray-700">{match.originalLostItemTitle}</span></p>
                          <div className="space-y-1">
                             {match.reasons.slice(0, 2).map((r, i) => (
                                <p key={i} className="text-[11px] text-gray-600 flex items-start gap-1">
                                   <span className="text-indigo-400 mt-0.5">•</span> {r.replace(/✅|🏷️|🎨|📍|🕒/g, '').trim()}
                                </p>
                             ))}
                          </div>
                          <Link to="/search" className="mt-3 block text-center w-full bg-white border border-gray-200 text-indigo-600 text-xs font-semibold py-1.5 rounded-lg hover:bg-indigo-50 transition">Review Match</Link>
                       </div>
                    ))}
                 </div>
              )}
            </div>
          </div>

        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
