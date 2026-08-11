import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Search as SearchIcon, Filter, MapPin, Tag, Calendar, AlertCircle, X, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useContext } from 'react';
import toast from 'react-hot-toast';

const SearchDatabase = () => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  
  // Modal State
  const [selectedItem, setSelectedItem] = useState(null);
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [proofText, setProofText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  // Fetch results when debounced query or category changes
  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (debouncedQuery) params.append('q', debouncedQuery);
        if (category) params.append('category', category);
        
        const { data } = await api.get(`/search?${params.toString()}`);
        setResults(data.data || []);
      } catch (error) {
        console.error('Search failed', error);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [debouncedQuery, category]);

  const categories = ['Electronics', 'Wallets', 'Keys', 'Bags', 'Documents', 'Other'];

  const handleClaimClick = () => {
    if (!user) {
      toast.error('Please log in to claim an item.');
      navigate('/login');
      return;
    }
    setShowClaimForm(true);
  };

  const handleSubmitClaim = async (e) => {
    e.preventDefault();
    if (!proofText.trim()) return toast.error('Please provide proof of ownership.');
    
    setIsSubmitting(true);
    try {
      await api.post('/claims', {
        itemId: selectedItem._id,
        itemType: selectedItem.itemType,
        description: proofText,
        proof: 'Text evidence provided' // Can be updated to support images later
      });
      toast.success('Claim submitted successfully! A moderator will review it.');
      setSelectedItem(null);
      setShowClaimForm(false);
      setProofText('');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to submit claim.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-gray-50 py-12 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Search Header */}
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl"
          >
            Search the Database
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto"
          >
            Find what you've lost by searching our centralized database. 
          </motion.p>
        </div>

        {/* Search Input & Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto mb-12 space-y-6"
        >
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <SearchIcon className="h-6 w-6 text-indigo-500" aria-hidden="true" />
            </div>
            <input
              type="text"
              className="block w-full rounded-2xl border-0 py-4 pl-12 pr-4 text-gray-900 shadow-lg shadow-indigo-100 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-lg sm:leading-6 transition-all"
              placeholder="Search by keywords, descriptions, or locations..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-sm font-medium text-gray-500 mr-2 flex items-center gap-1"><Filter size={16} /> Filter by:</span>
            <button
              onClick={() => setCategory('')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${!category ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${category === cat ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Results Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {results.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full py-20 text-center"
                >
                  <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No matching items found</h3>
                  <p className="mt-1 text-gray-500">Try adjusting your search terms or filters.</p>
                </motion.div>
              ) : (
                results.map((item, idx) => (
                  <motion.div
                    key={item._id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2, delay: idx * 0.05 }}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col"
                  >
                    <div className={`h-2 w-full ${item.itemType === 'LostItem' ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
                    
                    {item.imageUrl && (
                      <div className="h-48 w-full bg-gray-100 overflow-hidden">
                        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase ${item.itemType === 'LostItem' ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
                          {item.itemType === 'LostItem' ? 'Lost' : 'Found'}
                        </span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">{new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                      
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                      <p className="text-sm text-gray-600 flex-1 mb-4 line-clamp-3">{item.description}</p>
                      
                      <div className="mt-auto space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <MapPin size={16} className="text-indigo-400" /> {item.location}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Tag size={16} className="text-indigo-400" /> {item.category}
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => {
                          setSelectedItem(item);
                          setShowClaimForm(false);
                        }}
                        className="mt-6 w-full bg-indigo-50 text-indigo-700 font-medium py-2 rounded-xl hover:bg-indigo-100 transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Item Details Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            ></motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-2xl relative z-10 max-h-[90vh] flex flex-col"
            >
              <button 
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 transition-colors z-20"
              >
                <X size={20} />
              </button>

              <div className="overflow-y-auto p-8">
                <div className="flex items-center gap-3 mb-6">
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${selectedItem.itemType === 'LostItem' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>
                    {selectedItem.itemType === 'LostItem' ? 'Lost Item' : 'Found Item'}
                  </span>
                  <span className="text-sm text-gray-500 font-medium">{new Date(selectedItem.createdAt).toLocaleDateString()}</span>
                </div>

                <h2 className="text-3xl font-bold text-gray-900 mb-4">{selectedItem.title}</h2>
                
                {selectedItem.imageUrl && (
                  <div className="w-full h-64 bg-gray-100 rounded-2xl overflow-hidden mb-6 border border-gray-200">
                    <img src={selectedItem.imageUrl} alt={selectedItem.title} className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="prose prose-indigo text-gray-600 mb-8">
                  <p>{selectedItem.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100 mb-8">
                  <div>
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Category</span>
                    <span className="text-gray-900 font-medium">{selectedItem.category}</span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Location</span>
                    <span className="text-gray-900 font-medium flex items-center gap-1"><MapPin size={14} className="text-gray-400"/> {selectedItem.location}</span>
                  </div>
                  {selectedItem.brand && (
                    <div>
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Brand</span>
                      <span className="text-gray-900 font-medium">{selectedItem.brand}</span>
                    </div>
                  )}
                  {selectedItem.color && (
                    <div>
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Color</span>
                      <span className="text-gray-900 font-medium">{selectedItem.color}</span>
                    </div>
                  )}
                </div>

                {/* Claim Flow */}
                {selectedItem.itemType === 'FoundItem' && selectedItem.status !== 'CLAIMED' && (
                  <div className="mt-8 pt-8 border-t border-gray-100">
                    {!showClaimForm ? (
                      <div className="text-center bg-indigo-50 rounded-2xl p-6 border border-indigo-100">
                        <ShieldCheck className="mx-auto h-12 w-12 text-indigo-500 mb-3" />
                        <h4 className="text-lg font-bold text-gray-900 mb-2">Is this your item?</h4>
                        <p className="text-sm text-gray-600 mb-4">You can file a claim to recover this item. A moderator will verify your proof of ownership before releasing it.</p>
                        <button 
                          onClick={handleClaimClick}
                          className="bg-indigo-600 text-white font-medium px-6 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
                        >
                          Claim Item (Contact Moderator)
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmitClaim} className="bg-white border-2 border-indigo-100 rounded-2xl p-6 shadow-sm">
                        <h4 className="text-lg font-bold text-gray-900 mb-2">Provide Proof of Ownership</h4>
                        <p className="text-sm text-gray-500 mb-4">Please describe specific details (e.g., serial number, a scratch, contents of a wallet) to prove this belongs to you.</p>
                        <textarea
                          rows={4}
                          className="w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 border mb-4"
                          placeholder="I can identify this item because..."
                          value={proofText}
                          onChange={(e) => setProofText(e.target.value)}
                          required
                        />
                        <div className="flex justify-end gap-3">
                          <button 
                            type="button"
                            onClick={() => setShowClaimForm(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl"
                          >
                            Cancel
                          </button>
                          <button 
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-indigo-600 text-white font-medium px-6 py-2 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
                          >
                            {isSubmitting ? 'Submitting...' : 'Submit Claim'}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}
                
                {selectedItem.status === 'CLAIMED' && (
                  <div className="mt-8 pt-8 border-t border-gray-100">
                    <div className="text-center bg-gray-50 rounded-2xl p-6 border border-gray-200">
                      <p className="text-sm text-gray-600 font-medium">This item has already been claimed and recovered.</p>
                    </div>
                  </div>
                )}
                
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default SearchDatabase;
