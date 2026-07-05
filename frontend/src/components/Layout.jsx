import { Home, BookOpen, Bookmark, TrendingUp, History, Settings, Sun, ChevronDown } from 'lucide-react';

export default function Layout({ children }) {
  return (
    <div className="flex h-screen bg-[#F8F9FA] overflow-hidden">
      
      {/* LEFT SIDEBAR */}
      <aside className="w-64 bg-white flex flex-col justify-between border-r border-gray-100 shadow-sm z-10">
        <div>
          {/* Logo Area */}
          <div className="p-6 flex items-center gap-3">
            <div className="bg-violet-600 p-2 rounded-lg text-white">
              <BookOpen size={24} />
            </div>
            <div>
              <h1 className="font-bold text-xl leading-tight text-gray-900">TET Exam Prep</h1>
              <p className="text-xs text-gray-500 font-medium">Practice • Prepare • Succeed</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-4 space-y-1.5 mt-4">
            <NavItem icon={<Home size={20} />} label="Home" active />
            <NavItem icon={<BookOpen size={20} />} label="My Quizzes" />
            <NavItem icon={<Bookmark size={20} />} label="Bookmarks" />
            <NavItem icon={<TrendingUp size={20} />} label="Performance" />
            <NavItem icon={<History size={20} />} label="History" />
            <NavItem icon={<Settings size={20} />} label="Settings" />
          </nav>
        </div>

        {/* Motivation Card at bottom */}
        <div className="p-4 mb-4 mx-4 bg-[#F5F3FF] rounded-2xl text-center flex flex-col items-center">
           {/* Placeholder for Trophy Image */}
           <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm">🏆</div>
           <h4 className="font-bold text-gray-900 mb-1">You've got this!</h4>
           <p className="text-xs text-gray-500 pb-2">Every quiz brings you closer to success.</p>
        </div>
      </aside>

      {/* RIGHT MAIN AREA */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* HEADER */}
        <header className="h-20 bg-white/50 backdrop-blur-md flex items-center justify-end px-8 gap-6 z-10">
          <button className="p-2 bg-white rounded-full shadow-sm border border-gray-100 text-gray-600 hover:text-violet-600 transition">
            <Sun size={20} />
          </button>
          
          <div className="flex items-center gap-3 cursor-pointer">
            <div className="w-10 h-10 bg-violet-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
              U
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-gray-900 flex items-center gap-1">
                Welcome! <ChevronDown size={14} className="text-gray-400"/>
              </span>
              <span className="text-xs text-gray-500">Keep Learning 🔥</span>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT GOES HERE */}
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

// Helper component for Sidebar links
function NavItem({ icon, label, active }) {
  return (
    <a href="#" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
      active 
      ? 'bg-violet-600 text-white shadow-md shadow-violet-200' 
      : 'text-gray-500 hover:bg-violet-50 hover:text-violet-700'
    }`}>
      {icon}
      <span>{label}</span>
    </a>
  );
}