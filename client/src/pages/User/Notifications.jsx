import React, { useState } from 'react';
import { Bell, CheckCircle } from 'lucide-react';

const Notifications = () => {
  // In a real app, this would fetch from /api/notifications
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'MATCH', title: 'Possible Match Found!', message: 'An item matching your "Blue iPhone 13" has been reported.', date: new Date().toISOString(), read: false },
    { id: 2, type: 'CLAIM_UPDATE', title: 'Claim Approved', message: 'Your claim for "Keys" has been approved. Please visit the security desk.', date: new Date(Date.now() - 86400000).toISOString(), read: true },
    { id: 3, type: 'SYSTEM', title: 'Welcome to LostFound+', message: 'Thank you for joining our community.', date: new Date(Date.now() - 172800000).toISOString(), read: true }
  ]);

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
            <Bell className="text-indigo-500" size={32} /> Notifications
          </h1>
          <p className="mt-2 text-gray-500">Stay updated on your reports, claims, and system alerts.</p>
        </div>
        <button onClick={markAllAsRead} className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition flex items-center gap-1">
          <CheckCircle size={16} /> Mark all as read
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden divide-y divide-gray-100">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-gray-500">You're all caught up! No new notifications.</div>
        ) : (
          notifications.map(n => (
            <div key={n.id} className={`p-6 transition flex gap-4 ${n.read ? 'bg-white opacity-70' : 'bg-indigo-50/30'}`}>
               <div className={`p-3 rounded-full h-fit ${n.type === 'MATCH' ? 'bg-indigo-100 text-indigo-600' : n.type === 'CLAIM_UPDATE' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-600'}`}>
                 <Bell size={20} />
               </div>
               <div className="flex-1">
                 <div className="flex justify-between items-start mb-1">
                   <h3 className={`font-bold ${n.read ? 'text-gray-700' : 'text-gray-900'}`}>{n.title}</h3>
                   <span className="text-xs text-gray-400">{new Date(n.date).toLocaleDateString()}</span>
                 </div>
                 <p className="text-sm text-gray-600">{n.message}</p>
               </div>
               {!n.read && (
                 <button onClick={() => markAsRead(n.id)} className="w-3 h-3 bg-indigo-600 rounded-full self-center" aria-label="Mark as read" />
               )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
