import React, { useEffect, useState, useContext } from 'react';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { Sparkles, MapPin, Calendar, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Matches = () => {
  const { user, loading: authLoading } = useContext(AuthContext);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user?._id) { setLoading(false); return; }
    const fetchMatches = async () => {
      try {
        const lostRes = await api.get(`/lost?reportedBy=${user._id}`);
        const lostItems = lostRes.data.data || [];
        
        let allMatches = [];
        for (const lostItem of lostItems) {
           if (lostItem.status === 'OPEN') {
               try {
                   const matchRes = await api.get(`/lost/${lostItem._id}/matches`);
                   const itemMatches = matchRes.data.data || [];
                   itemMatches.forEach(m => {
                     m.originalLostItemId = lostItem._id;
                     m.originalLostItemTitle = lostItem.title;
                   });
                   allMatches = [...allMatches, ...itemMatches];
               } catch (e) {
                   console.error("Failed to fetch matches for", lostItem._id);
               }
           }
        }
        
        allMatches.sort((a,b) => b.score - a.score);
        setMatches(allMatches);
      } catch (error) {
        toast.error('Failed to load AI matches');
      } finally {
        setLoading(false);
      }
    };
    if (!authLoading && user?._id) fetchMatches();
  }, [user, authLoading]);

  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
          <Sparkles className="text-indigo-500" size={32} /> Potential Matches
        </h1>
        <p className="mt-2 text-gray-500">Our AI matching engine constantly scans the database to find your lost items.</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-[40vh]">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      ) : (
        <AnimatePresence>
          {matches.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-gray-200 rounded-2xl p-16 text-center shadow-sm"
            >
              <Sparkles className="mx-auto h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-xl font-medium text-gray-900">No matches found yet</h3>
              <p className="mt-2 text-gray-500 max-w-sm mx-auto">We'll keep searching 24/7. Check back later or make sure your Lost Item report has as many details as possible.</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {matches.map((match, idx) => (
                <motion.div
                  key={`${match.item._id}-${idx}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col"
                >
                  <div className={`h-2 w-full ${match.matchLabel === 'Strong Match' ? 'bg-emerald-500' : match.matchLabel === 'Possible Match' ? 'bg-amber-400' : 'bg-indigo-400'}`}></div>
                  
                  {match.item.imageUrl && (
                    <div className="h-48 w-full bg-gray-100 overflow-hidden relative">
                      <img src={match.item.imageUrl} alt={match.item.title} className="w-full h-full object-cover" />
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                        {match.score}% Match
                      </div>
                    </div>
                  )}

                  <div className="p-6 flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wide ${match.matchLabel === 'Strong Match' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                        {match.matchLabel}
                      </span>
                      {!match.item.imageUrl && <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">{match.score}% Match</span>}
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{match.item.title}</h3>
                    <p className="text-sm text-gray-500 mb-4">You lost: <span className="font-semibold text-gray-700">{match.originalLostItemTitle}</span></p>
                    
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin size={16} className="mr-2 text-gray-400" /> {match.item.location}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar size={16} className="mr-2 text-gray-400" /> {new Date(match.item.dateFound).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100/50">
                      <p className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <Sparkles size={14} /> AI Analysis
                      </p>
                      <ul className="space-y-1">
                        {match.reasons.map((r, i) => (
                          <li key={i} className="text-xs text-indigo-700/80 flex items-start">
                            <span className="mr-1.5">•</span> {r.replace(/✅|🏷️|🎨|📍|🕒/g, '').trim()}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 border-t border-gray-100 mt-auto">
                    <Link to={`/search?item=${match.item._id}`} className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition">
                      Review & Claim <ExternalLink size={16} />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

export default Matches;
