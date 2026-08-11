import React, { useContext, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Search, PlusCircle, Bell, User, Menu, X, Shield, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Floating Navbar */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-50">
        <nav className="bg-white/70 backdrop-blur-xl shadow-lg shadow-indigo-100/20 border border-white/80 rounded-full transition-all duration-300">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              
              {/* Logo */}
              <div className="flex items-center">
                <Link to={user ? "/dashboard" : "/"} className="flex-shrink-0 flex items-center gap-2 group">
                  <motion.img
                    src="/favicon.jpg"
                    alt="LostFound+ Logo"
                    whileHover={{ scale: 1.08, rotate: 5 }}
                    className="h-9 w-9 rounded-xl object-cover shadow-sm"
                  />
                  <motion.span 
                    whileHover={{ scale: 1.05 }}
                    className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 transition-all tracking-tight"
                  >
                    LostFound+
                  </motion.span>
                </Link>
              </div>
              
              {/* Desktop Menu */}
              <div className="hidden md:flex items-center space-x-2">
                {user ? (
                  <>
                    <div className="flex items-center bg-gray-50/50 p-1 rounded-full border border-gray-100 mr-2">
                      <Link to="/search" className={`relative p-2.5 rounded-full transition-colors flex items-center gap-2 ${isActive('/search') ? 'text-indigo-600 bg-white shadow-sm' : 'text-gray-500 hover:text-indigo-600 hover:bg-white'}`}>
                        <Search size={18} />
                        {isActive('/search') && <span className="text-sm font-semibold pr-2">Search</span>}
                      </Link>
                      
                      <Link to="/report-lost" className={`relative p-2.5 rounded-full transition-colors flex items-center gap-2 ${isActive('/report-lost') ? 'text-rose-600 bg-white shadow-sm' : 'text-gray-500 hover:text-rose-600 hover:bg-white'}`} title="Report Item">
                        <PlusCircle size={18} />
                        {isActive('/report-lost') && <span className="text-sm font-semibold pr-2">Report</span>}
                      </Link>
                      
                      <Link to="/notifications" className={`relative p-2.5 rounded-full transition-colors flex items-center gap-2 ${isActive('/notifications') ? 'text-amber-600 bg-white shadow-sm' : 'text-gray-500 hover:text-amber-600 hover:bg-white'}`}>
                        <Bell size={18} />
                        {/* Mock notification dot */}
                        <span className="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
                      </Link>
                    </div>
                    
                    {user.role === 'admin' && (
                      <Link to="/admin" className={`flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-full transition-all ${isActive('/admin') ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'}`}>
                        <Activity size={16} /> Admin
                      </Link>
                    )}
                    {user.role === 'moderator' && (
                      <Link to="/moderator" className={`flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-full transition-all ${isActive('/moderator') ? 'bg-orange-500 text-white shadow-md shadow-orange-200' : 'text-gray-600 hover:bg-orange-50 hover:text-orange-600'}`}>
                        <Shield size={16} /> Mod
                      </Link>
                    )}
                    
                    <div className="relative group ml-2">
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center space-x-2 text-gray-700 bg-white border border-gray-200 shadow-sm px-4 py-2 rounded-full transition-all hover:border-indigo-300 hover:shadow-md"
                      >
                        <User size={16} className="text-indigo-600" />
                        <span className="text-sm font-medium">{user.name}</span>
                      </motion.button>
                      
                      {/* Dropdown Menu */}
                      <div className="absolute right-0 w-56 mt-3 py-2 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right group-hover:translate-y-0 translate-y-2">
                        <div className="px-4 py-3 border-b border-gray-100 mb-2">
                          <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                        <Link to="/my-reports" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors mx-2 rounded-xl">My Reports</Link>
                        <Link to="/my-claims" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors mx-2 rounded-xl">My Claims</Link>
                        <hr className="my-2 border-gray-100" />
                        <button onClick={logout} className="block w-full text-left px-4 py-2.5 text-sm text-rose-600 font-medium hover:bg-rose-50 transition-colors mx-2 rounded-xl">
                          Sign out
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center space-x-3">
                    <Link to="/login" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors px-4 py-2 rounded-full hover:bg-gray-50">Log in</Link>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Link to="/register" className="bg-indigo-600 text-white px-6 py-2.5 rounded-full font-medium hover:bg-indigo-700 shadow-md shadow-indigo-200 hover:shadow-lg transition-all">Get Started</Link>
                    </motion.div>
                  </div>
                )}
              </div>
              
              {/* Mobile menu button */}
              <div className="md:hidden flex items-center">
                <button 
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                  className="text-gray-500 hover:text-indigo-600 p-2 bg-gray-50 rounded-full"
                >
                  {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>
            </div>
          </div>
        </nav>
        
        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute top-20 left-0 w-full bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100 p-4 md:hidden overflow-hidden"
            >
              <div className="flex flex-col space-y-2">
                {user ? (
                  <>
                    <div className="flex items-center gap-3 p-4 bg-indigo-50/50 rounded-2xl mb-2">
                      <div className="bg-indigo-100 p-2 rounded-full"><User size={20} className="text-indigo-600" /></div>
                      <div>
                        <p className="font-semibold text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    
                    <Link to="/search" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 text-gray-700"><Search size={20} className="text-indigo-500" /> Search Database</Link>
                    <Link to="/report-lost" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 text-gray-700"><PlusCircle size={20} className="text-rose-500" /> Report Item</Link>
                    <Link to="/notifications" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 text-gray-700"><Bell size={20} className="text-amber-500" /> Notifications</Link>
                    
                    {user.role === 'admin' && (
                      <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 text-gray-700"><Activity size={20} className="text-indigo-500" /> Admin Dashboard</Link>
                    )}
                    {user.role === 'moderator' && (
                      <Link to="/moderator" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 text-gray-700"><Shield size={20} className="text-orange-500" /> Mod Queue</Link>
                    )}
                    
                    <hr className="border-gray-100 my-2" />
                    <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="flex items-center gap-3 p-3 rounded-xl hover:bg-rose-50 text-rose-600 font-medium w-full text-left">
                      Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="p-3 text-center rounded-xl text-gray-700 font-medium hover:bg-gray-50">Log in</Link>
                    <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="p-3 text-center rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 shadow-sm">Get Started</Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Spacer to push content down since navbar is fixed and detached */}
      <div className="h-24"></div>
    </>
  );
};

export default Navbar;
