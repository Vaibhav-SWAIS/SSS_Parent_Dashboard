'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();
  
  const menuItems = [
    { name: 'Dashboard', icon: '🏠', path: '/parent/dashboard' },
    { name: 'Assignments', icon: '📄', path: '/parent/assignments' },
    { name: 'Quiz Performance', icon: '📊', path: '/parent/quiz' },
    { name: 'Teacher Remarks', icon: '💬', path: '/parent/remarks' },
    { name: 'Notices', icon: '🔔', path: '/parent/notices' },
    { name: 'Analytics', icon: '📈', path: '/parent/analytics' },
    { name: 'Communication Center', icon: '🏫', path: '/parent/communication' },
  ];

  return (
    <aside className="w-64 bg-gray-800 text-white flex flex-col h-screen fixed left-0 top-0 overflow-y-auto">
      <div className="p-6 flex items-center gap-3 border-b border-gray-700">
        <div className="bg-orange-600 p-2 rounded-lg">
          <span className="text-xl">📖</span>
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight">SGS-SWAIS</h1>
          <p className="text-xs text-gray-400">Parent Dashboard</p>
        </div>
      </div>
      
      <nav className="flex-1 py-6">
        <ul className="space-y-2 px-4">
          {menuItems.map((item, index) => {
            const isActive = pathname.startsWith(item.path);
            return (
              <li key={index}>
                <Link
                  href={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-orange-600 text-white' 
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span className="font-medium">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 mt-auto">
        <div className="bg-[#F3E8DD] rounded-xl p-4 text-center text-gray-800 shadow-sm relative overflow-hidden">
          <div className="flex justify-center mb-2">
            <span className="text-4xl">👨‍👩‍👦</span>
          </div>
          <p className="text-sm font-medium leading-tight">Stay connected with your child&apos;s learning journey.</p>
        </div>
      </div>
    </aside>
  );
}
