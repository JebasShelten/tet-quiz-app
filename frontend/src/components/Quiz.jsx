import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import Layout from './Layout';
import { Calendar, Clock, ArrowLeft, ArrowRight, Bookmark } from 'lucide-react';

export default function Quiz({ bankId, onBack }) {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // This will store the user's answers. Example: { 1: 'A', 2: 'C' }
  const [userAnswers, setUserAnswers] = useState({}); 

  useEffect(() => {
    async function fetchQuestions() {
      // Fetch all questions linked to the specific bank the user clicked
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('question_bank_id', bankId)
        .order('question_number', { ascending: true });

      if (data) setQuestions(data);
      setLoading(false);
    }
    fetchQuestions();
  }, [bankId]);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-500 border-t-transparent"></div>
        </div>
      </Layout>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 pb-10">
        
        {/* LEFT COLUMN: The Question Area */}
        <div className="flex-1 flex flex-col gap-6">
          
          {/* Top Bar: Back Button & Timer */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center justify-between">
            <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-violet-600 transition font-medium">
              <ArrowLeft size={20} /> Back to Dashboard
            </button>
            <div className="flex items-center gap-2 bg-violet-50 text-violet-700 px-4 py-2 rounded-lg font-bold">
              <Clock size={20} /> 150:00
            </div>
          </div>

          {/* Question Box */}
          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm relative">
            <div className="flex justify-between items-center mb-6">
              <span className="font-bold text-gray-500">Question {currentIndex + 1} of {questions.length}</span>
              <button className="text-gray-400 hover:text-violet-600 flex items-center gap-1 text-sm font-medium transition">
                <Bookmark size={16} /> Bookmark
              </button>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-100 h-2 rounded-full mb-8 overflow-hidden">
              <div 
                className="bg-violet-600 h-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              ></div>
            </div>

            {/* The Actual Question */}
            <h2 className="text-2xl font-bold text-gray-900 mb-8">{currentQ.question_text}</h2>

            {/* The Options (Static for now) */}
            <div className="flex flex-col gap-4">
              {['A', 'B', 'C', 'D'].map((letter) => {
                const optionText = currentQ[`option_${letter.toLowerCase()}`];
                if (!optionText || optionText === 'EMPTY') return null;
                
                return (
                  <button key={letter} className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-100 hover:border-violet-300 hover:bg-violet-50 transition text-left group">
                    <span className="w-10 h-10 flex-shrink-0 bg-gray-100 group-hover:bg-violet-200 text-gray-600 group-hover:text-violet-700 font-bold rounded-full flex items-center justify-center transition">
                      {letter}
                    </span>
                    <span className="text-gray-700 font-medium text-lg">{optionText}</span>
                  </button>
                );
              })}
            </div>

            {/* Bottom Nav Buttons */}
            <div className="flex justify-between items-center mt-10 pt-6 border-t border-gray-100">
              <button 
                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 disabled:opacity-50 transition"
              >
                Previous
              </button>
              <button 
                onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                disabled={currentIndex === questions.length - 1}
                className="px-6 py-3 bg-violet-600 text-white rounded-xl font-bold hover:bg-violet-700 transition shadow-md flex items-center gap-2"
              >
                Next <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: The Navigation Grid & Stats (Placeholders for next step) */}
        <div className="w-full lg:w-80 flex flex-col gap-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Question Navigator</h3>
            <div className="grid grid-cols-5 gap-2">
              {/* Generate 20 dummy circles to see the layout */}
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold cursor-pointer transition ${i === currentIndex ? 'bg-orange-100 text-orange-600 border-2 border-orange-500' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                  {i + 1}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </Layout>
  );
}