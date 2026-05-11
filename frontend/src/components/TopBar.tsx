'use client';
import { useState, useEffect } from 'react';
import ChildSelector from './ChildSelector';
import LanguageSelector from './LanguageSelector';
import { fetchNotifications } from '@/lib/api';
import Link from 'next/link';
import { BellIcon } from '@heroicons/react/24/outline';

export default function TopBar({ studentId, setStudentId, language, setLanguage, isLoading = false }: any) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (!studentId) return;
    const loadNotifications = async () => {
      try {
        const data = await fetchNotifications(studentId);
        setNotifications(data);
      } catch (err) {
        console.error('Failed to load notifications:', err);
      }
    };
    loadNotifications();
  }, [studentId]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 border-b border-gray-200 sticky top-0 z-50">
      <div className="flex items-center gap-4 w-full md:w-auto">
        <ChildSelector 
          currentStudentId={studentId} 
          onSelect={setStudentId} 
          disabled={isLoading}
        />
        <LanguageSelector 
          currentLang={language} 
          onSelect={setLanguage} 
          disabled={isLoading}
        />
      </div>
      <div className="flex items-center gap-6 w-full md:w-auto justify-end relative">
        <button 
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative text-gray-500 hover:text-gray-700 transition-colors"
        >
          <BellIcon className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold shadow-sm">
              {unreadCount}
            </span>
          )}
        </button>

        {showNotifications && (
          <div className="absolute top-12 right-12 w-80 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-800">Notifications</h3>
              <span className="text-xs text-orange-600 font-semibold cursor-pointer hover:underline">Mark all as read</span>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500">No new notifications</div>
              ) : (
                notifications.map((n: any, idx: number) => (
                  <Link key={idx} href={n.link} className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors flex gap-3 items-start cursor-pointer block">
                    <span className="text-xl shrink-0">{n.type === 'ticket_reply' ? '💬' : '📢'}</span>
                    <div>
                      <p className="text-sm text-gray-800 font-medium">{n.title}</p>
                      <p className="text-xs text-gray-600 mt-0.5 line-clamp-1">{n.message}</p>
                      <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-wider">
                        {n.date ? new Date(n.date).toLocaleDateString() : 'Just now'}
                      </p>
                    </div>
                  </Link>
                ))
              )}
            </div>
            <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
              <Link href="/parent/communication" className="text-xs font-bold text-gray-500 hover:text-orange-600 uppercase tracking-wider">
                View All Communications
              </Link>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 border-l pl-6 border-gray-200">
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold overflow-hidden shadow-sm">
            <img src="https://i.pravatar.cc/150?img=47" alt="Profile" className="w-full h-full object-cover"/>
          </div>
          <div className="text-sm hidden sm:block">
            <p className="text-gray-500 text-xs">Welcome,</p>
            <p className="font-bold text-gray-800">Priya Sharma</p>
          </div>
        </div>
      </div>
    </header>
  );
}
