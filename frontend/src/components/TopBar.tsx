'use client';
import ChildSelector from './ChildSelector';
import LanguageSelector from './LanguageSelector';

export default function TopBar({ studentId, setStudentId, language, setLanguage, isLoading = false }: any) {
  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 border-b border-gray-200 sticky top-0 z-10">
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
      <div className="flex items-center gap-6 w-full md:w-auto justify-end">
        <button className="relative text-gray-500 hover:text-gray-700 transition-colors">
          <span className="text-2xl">🔔</span>
          <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold shadow-sm">2</span>
        </button>
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
