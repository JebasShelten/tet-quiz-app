import { useState } from 'react';
import { Home, BookOpen, Bookmark, TrendingUp, History, Settings, Sun, ChevronDown, Menu, X } from 'lucide-react';

export default function Layout({ children, currentView, onNavigate }) {
  // State to control if the sidebar is open or closed
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-[#F8F9FA] overflow-hidden font-sans">
      
      {/* FLOATING SIDEBAR */}
      <aside 
        className={`fixed lg:relative z-50 h-[calc(100vh-2rem)] my-4 ml-4 transition-all duration-300 ease-in-out bg-white rounded-3xl shadow-xl flex flex-col justify-between border border-gray-100 overflow-hidden
          ${isSidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full lg:w-20 lg:translate-x-0'}
        `}
      >
        <div>
          <div className="p-6 flex items-center gap-3">
            <div className="bg-violet-600 min-w-[40px] h-10 rounded-xl text-white flex items-center justify-center shadow-md">
              <BookOpen size={24} />
            </div>
            {/* Hide text when collapsed */}
            <div className={`transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'}`}>
              <h1 className="font-bold text-xl leading-tight text-gray-900 whitespace-nowrap">TET Exam Prep</h1>
            </div>
          </div>

          {/* Navigation Links - Now fully functional! */}
          <nav className="px-4 space-y-2 mt-4">
            <NavItem icon={<Home size={20} />} label="Home" active={currentView === 'home' || currentView === 'quiz'} isOpen={isSidebarOpen} onClick={() => onNavigate('home')} />
            <NavItem icon={<BookOpen size={20} />} label="My Quizzes" active={currentView === 'quizzes'} isOpen={isSidebarOpen} onClick={() => onNavigate('quizzes')} />
            <NavItem icon={<Bookmark size={20} />} label="Bookmarks" active={currentView === 'bookmarks'} isOpen={isSidebarOpen} onClick={() => onNavigate('bookmarks')} />
            <NavItem icon={<TrendingUp size={20} />} label="Performance" active={currentView === 'performance'} isOpen={isSidebarOpen} onClick={() => onNavigate('performance')} />
            <NavItem icon={<History size={20} />} label="History" active={currentView === 'history'} isOpen={isSidebarOpen} onClick={() => onNavigate('history')} />
            <NavItem icon={<Settings size={20} />} label="Settings" active={currentView === 'settings'} isOpen={isSidebarOpen} onClick={() => onNavigate('settings')} />
          </nav>
        </div>

        {/* Hide motivation card when collapsed */}
        <div className={`p-4 mb-4 mx-4 bg-[#F5F3FF] rounded-2xl text-center flex flex-col items-center transition-all duration-300 ${isSidebarOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-0 hidden'}`}>
           <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm text-xl">🏆</div>
           <h4 className="font-bold text-gray-900 text-sm mb-1">You've got this!</h4>
        </div>
      </aside>

      {/* RIGHT MAIN AREA */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* HEADER */}
        <header className="h-20 flex items-center justify-between px-8 z-10">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 bg-white rounded-xl shadow-sm border border-gray-100 text-gray-600 hover:text-violet-600 hover:bg-violet-50 transition transform active:scale-95"
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div className="flex items-center gap-6">
            <button className="p-2 bg-white rounded-full shadow-sm border border-gray-100 text-gray-600 hover:text-violet-600 hover:bg-violet-50 transition">
              <Sun size={20} />
            </button>
            
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="w-10 h-10 bg-violet-600 rounded-full flex items-center justify-center text-white font-bold shadow-md group-hover:bg-violet-700 transition">
                U
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-900 flex items-center gap-1 group-hover:text-violet-600 transition">
                  Welcome! <ChevronDown size={14} className="text-gray-400"/>
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 pt-0">
          {children}
        </main>
      </div>
    </div>
  );
}

// Changed from <a> to <button> and added cursor-pointer
function NavItem({ icon, label, active, isOpen, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 font-medium group cursor-pointer
      ${active ? 'bg-violet-600 text-white shadow-md shadow-violet-200' : 'text-gray-500 hover:bg-violet-50 hover:text-violet-700'}
    `}>
      <div className="min-w-[20px]">{icon}</div>
      <span className={`transition-all duration-300 whitespace-nowrap text-left ${isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'}`}>
        {label}
      </span>
    </button>
  );
}