import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  Home, Search, PlusCircle, Inbox, Clock, Bell, User, Settings, LogOut,
  ShieldCheck, AlertTriangle, Users, BarChart2, CheckCircle, Database, LayoutDashboard
} from 'lucide-react';

const Sidebar = ({ isMobileOpen, setIsMobileOpen }) => {
  const { user, logout } = useContext(AuthContext);

  const getNavLinks = () => {
    switch (user?.role) {
      case 'admin':
        return [
          { name: 'Command Center', path: '/admin', icon: LayoutDashboard },
          { name: 'Users', path: '/admin/users', icon: Users },
          { name: 'Moderators', path: '/admin/moderators', icon: ShieldCheck },
          { name: 'Organizations', path: '/admin/organizations', icon: Database },
          { name: 'All Reports', path: '/admin/reports', icon: Inbox },
          { name: 'All Claims', path: '/admin/claims', icon: CheckCircle },
          { name: 'Fraud & Duplicates', path: '/admin/fraud', icon: AlertTriangle },
          { name: 'Analytics', path: '/admin/analytics', icon: BarChart2 },
          { name: 'Recovery Insights', path: '/admin/insights', icon: Search },
          { name: 'Audit Logs', path: '/admin/audit-logs', icon: Clock },
          { name: 'Categories', path: '/admin/categories', icon: Settings }
        ];
      case 'moderator':
        return [
          { name: 'Trust Center', path: '/moderator', icon: LayoutDashboard },
          { name: 'Reports', path: '/moderator/reports', icon: Inbox },
          { name: 'Claims', path: '/moderator/claims', icon: CheckCircle },
          { name: 'Suspicious Reports', path: '/moderator/suspicious', icon: AlertTriangle },
          { name: 'Duplicate Reports', path: '/moderator/duplicates', icon: Database },
          { name: 'Disputes', path: '/moderator/disputes', icon: Users },
          { name: 'Handover', path: '/moderator/handover', icon: Search },
          { name: 'Recovery Tracking', path: '/moderator/recovery', icon: Clock },
          { name: 'Notifications', path: '/notifications', icon: Bell }
        ];
      case 'user':
      default:
        return [
          { name: 'Recovery Center', path: '/dashboard', icon: LayoutDashboard },
          { name: 'Report Lost Item', path: '/report-lost', icon: PlusCircle },
          { name: 'Report Found Item', path: '/report-found', icon: PlusCircle },
          { name: 'Search Items', path: '/search', icon: Search },
          { name: 'Potential Matches', path: '/matches', icon: CheckCircle },
          { name: 'My Reports', path: '/my-reports', icon: Inbox },
          { name: 'My Claims', path: '/my-claims', icon: Clock },
          { name: 'Notifications', path: '/notifications', icon: Bell },
          { name: 'Recovery History', path: '/recovery-history', icon: Search }
        ];
    }
  };

  const navLinks = getNavLinks();

  const handleLinkClick = () => {
    if (setIsMobileOpen) setIsMobileOpen(false);
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200 w-64 flex-shrink-0">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-gray-100 flex-shrink-0 gap-2">
        <img src="/favicon.jpg" alt="LostFound+" className="h-8 w-8 rounded-lg object-cover shadow-sm" />
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight">
          LostFound+
        </span>
        <span className={`ml-auto text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${user?.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : user?.role === 'moderator' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'}`}>
          {user?.role}
        </span>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-hide">
        {navLinks.map((link) => (
          <NavLink
            key={link.name}
            to={link.path}
            onClick={handleLinkClick}
            end={link.path === '/admin' || link.path === '/moderator' || link.path === '/dashboard'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <link.icon size={18} className={isActive ? 'text-indigo-600' : 'text-gray-400'} />
                {link.name}
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* Bottom Profile / Settings */}
      <div className="p-4 border-t border-gray-100 flex-shrink-0 space-y-1">
        <NavLink 
          to="/profile" 
          onClick={handleLinkClick}
          className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}
        >
          <User size={18} className="text-gray-400" /> Profile
        </NavLink>
        <button 
          onClick={logout} 
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition-all text-left"
        >
          <LogOut size={18} className="text-rose-500" /> Log out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
