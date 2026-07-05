import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import Layout from './Layout';
import { ClipboardList, Database, CheckCircle, Trophy, ChevronDown, Bookmark, Calendar, ArrowRight, Lightbulb } from 'lucide-react';

const cardThemes = [
  { main: 'bg-violet-600', light: 'bg-violet-50', text: 'text-violet-600' },
  { main: 'bg-blue-500', light: 'bg-blue-50', text: 'text-blue-500' },
  { main: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-500' },
  { main: 'bg-orange-500', light: 'bg-orange-50', text: 'text-orange-500' },
  { main: 'bg-pink-500', light: 'bg-pink-50', text: 'text-pink-500' },
];

export default function Dashboard({ onSelectBank }) {
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // NEW: State for user progress
  const [stats, setStats] = useState({ completed: 0, bestScore: '--' });
  const [userProgress, setUserProgress] = useState({}); // Stores status for each bank

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      
      // 1. Fetch all question banks
      const { data: banksData } = await supabase.from('question_banks').select('*').order('exam_date', { ascending: true });
      if (banksData) setBanks(banksData);

      // 2. Fetch user's specific progress
      if (user) {
        const { data: progressData } = await supabase.from('quiz_results').select('*').eq('user_id', user.id);
        
        if (progressData) {
          let completedCount = 0;
          let highestScore = 0;
          const progressMap = {};

          progressData.forEach(attempt => {
            progressMap[attempt.bank_id] = attempt.status;
            if (attempt.status === 'completed') {
              completedCount++;
              if (attempt.score > highestScore) highestScore = attempt.score;
            }
          });

          setStats({ completed: completedCount, bestScore: completedCount > 0 ? highestScore : '--' });
          setUserProgress(progressMap);
        }
      }
      setLoading(false);
    }
    fetchData();
  }, []);

// ... Keep the rest of your UI the same, BUT change the Start Quiz button! ...

  return (
      <div className="max-w-7xl mx-auto flex flex-col gap-8 pb-10">
        
        {/* TOP SECTION: Banner & Stats */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Gradient Banner */}
          <div className="flex-1 bg-gradient-to-r from-indigo-600 to-violet-500 rounded-2xl p-8 flex items-center justify-between text-white shadow-lg shadow-indigo-200">
            <div className="flex items-center gap-6">
              <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
                <ClipboardList size={40} className="text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-1">Select a Question Set</h2>
                <p className="text-indigo-100 font-medium">Choose any session to start your quiz</p>
              </div>
            </div>
            {/* Decorative Icon */}
            <ClipboardList size={120} className="text-white/10 absolute right-12 lg:right-[40%] transform rotate-12 pointer-events-none hidden md:block" />
          </div>

          {/* 3 Stat Cards */}
          <div className="flex gap-4">
            <StatCard icon={<Database className="text-violet-500" />} value={banks.length} label="Total Sets" bg="bg-violet-50" />
            <StatCard icon={<CheckCircle className="text-emerald-500" />} value="0" label="Completed" bg="bg-emerald-50" />
            <StatCard icon={<Trophy className="text-orange-500" />} value="--" label="Best Score" bg="bg-orange-50" />
          </div>
        </div>

        {/* MIDDLE SECTION: Title & Sort */}
        <div className="flex items-center justify-between mt-4">
          <h3 className="text-xl font-bold text-gray-900">Available TET Question Sets</h3>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 shadow-sm transition">
            <Calendar size={16} /> Sort by Date (Newest) <ChevronDown size={16} />
          </button>
        </div>

        {/* GRID SECTION: Dynamic Quiz Cards */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-500 border-t-transparent"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 lg:grid-cols-6 gap-6">
            {banks.map((bank, index) => {
              const theme = cardThemes[index % cardThemes.length];
              const sessionText = bank.session === 'FN' ? 'Forenoon Session' : 'Afternoon Session';
              const bankNumber = String(index + 1).padStart(2, '0');

              return (
                <div key={bank.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group relative">
                  
                  {/* Card Header (Number Badge & Bookmark) */}
                  <div className="flex justify-between items-start mb-4">
                    <span className={`${theme.main} text-white text-xs font-bold px-2 py-1 rounded-md`}>
                      {bankNumber}
                    </span>
                    <button className="text-gray-300 hover:text-gray-500 transition">
                      <Bookmark size={20} />
                    </button>
                  </div>

                  {/* Card Body (Date & Session Info) */}
                  <div className="flex flex-col items-center text-center flex-1 mb-6 mt-2">
                    <div className={`${theme.light} ${theme.text} p-3 rounded-full mb-3 group-hover:scale-110 transition-transform`}>
                      <Calendar size={24} />
                    </div>
                    <h4 className="font-bold text-gray-900 text-lg">{bank.exam_date}</h4>
                    <p className="text-sm text-gray-500 font-medium mb-3">{sessionText}</p>
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                      Session: {bank.session}
                    </span>
                  </div>

                  {/* Card Button - Dynamic based on Database Status */}
                  <button 
                    onClick={() => onSelectBank(bank.id)}
                    className={`w-full font-semibold py-3 rounded-xl flex items-center justify-center gap-2 opacity-90 hover:opacity-100 transition shadow-md
                      ${userProgress[bank.id] === 'completed' ? 'bg-emerald-500 text-white' : 
                        userProgress[bank.id] === 'in_progress' ? 'bg-orange-500 text-white' : 
                        `${theme.main} text-white`}
                    `}
                  >
                    {userProgress[bank.id] === 'completed' ? 'View Results' : 
                     userProgress[bank.id] === 'in_progress' ? 'Resume Quiz' : 'Start Quiz'} 
                    <ArrowRight size={18} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* BOTTOM TIP BANNER */}
        <div className="mt-4 bg-white border border-gray-100 rounded-2xl p-5 flex items-center gap-4 shadow-sm relative overflow-hidden">
          <div className="bg-violet-100 p-3 rounded-full z-10">
            <Lightbulb size={24} className="text-violet-600" />
          </div>
          <div className="z-10">
            <h4 className="font-bold text-gray-900">Tip</h4>
            <p className="text-sm text-gray-500">Choose any question set to begin your practice. All the best! 🚀</p>
          </div>
          {/* Decorative books icon on the right (matching UI) */}
          <div className="absolute right-0 bottom-0 text-7xl opacity-5 transform translate-y-4">
            📚
          </div>
        </div>

      </div>
  );
}

// Reusable mini-component for the top stat cards
function StatCard({ icon, value, label, bg }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col items-center justify-center min-w-[140px]">
      <div className={`${bg} p-3 rounded-full mb-3`}>
        {icon}
      </div>
      <span className="text-2xl font-bold text-gray-900 leading-none mb-1">{value}</span>
      <span className="text-xs text-gray-500 font-medium">{label}</span>
    </div>
  );
}