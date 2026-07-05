import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import Layout from './Layout';
import { Clock, ArrowLeft, ArrowRight, Bookmark } from 'lucide-react';
import confetti from 'canvas-confetti'; // Import our new animation!

export default function Quiz({ bankId, onBack }) {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Track which option the user clicked for each question index
  const [userAnswers, setUserAnswers] = useState({});
  // Track animation state for wrong answers
  const [shake, setShake] = useState(false);

  useEffect(() => {
    async function fetchQuestions() {
      const { data } = await supabase
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
  // Prioritize the 'final_key' if Jerish updated it, otherwise use 'correct_option'
  const trueAnswer = currentQ?.final_key || currentQ?.correct_option;
  const answeredOption = userAnswers[currentIndex];
  const hasAnswered = !!answeredOption;

  const handleOptionClick = (letter) => {
    if (hasAnswered) return; // Prevent changing answer once clicked

    // Save answer
    setUserAnswers(prev => ({ ...prev, [currentIndex]: letter }));

    if (letter === trueAnswer) {
      // 🎉 Celebration for correct!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#8b5cf6', '#10b981', '#3b82f6']
      });
    } else {
      // ❌ Shake animation for wrong!
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto flex flex-col xl:flex-row gap-6 pb-10">
        
        {/* LEFT COLUMN: Question Area */}
        <div className={`flex-1 flex flex-col gap-6 transition-transform ${shake ? 'translate-x-2' : ''}`}>
          
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center justify-between">
            <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-violet-600 transition font-medium">
              <ArrowLeft size={20} /> Back to Dashboard
            </button>
            <div className="flex items-center gap-2 bg-violet-50 text-violet-700 px-4 py-2 rounded-lg font-bold">
              <Clock size={20} /> 150:00
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 md:p-10 border border-gray-100 shadow-sm relative min-h-[500px] flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-6">
                <span className="font-bold text-gray-500">Question {currentIndex + 1} of {questions.length}</span>
                <button className="text-gray-400 hover:text-orange-500 flex items-center gap-1 text-sm font-medium transition transform active:scale-95">
                  <Bookmark size={18} /> Bookmark
                </button>
              </div>

              <div className="w-full bg-gray-100 h-2 rounded-full mb-8 overflow-hidden">
                <div 
                  className="bg-violet-600 h-full transition-all duration-500 ease-out"
                  style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                ></div>
              </div>

              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-8 leading-relaxed">
                {currentQ.question_text}
              </h2>

              {/* Dynamic Options Grid */}
              <div className="flex flex-col gap-3">
                {['A', 'B', 'C', 'D'].map((letter) => {
                  const optionText = currentQ[`option_${letter.toLowerCase()}`];
                  if (!optionText || optionText === 'EMPTY') return null;
                  
                  // Grading Logic
                  let btnClass = "border-gray-100 bg-white text-gray-700 hover:border-violet-300 hover:bg-violet-50 cursor-pointer";
                  let iconClass = "bg-gray-100 text-gray-600";

                  if (hasAnswered) {
                    if (letter === trueAnswer) {
                      // The correct answer always highlights green
                      btnClass = "border-emerald-500 bg-emerald-50 text-emerald-900 shadow-md scale-[1.02] transition-transform";
                      iconClass = "bg-emerald-500 text-white";
                    } else if (letter === answeredOption && letter !== trueAnswer) {
                      // The user's wrong answer highlights red
                      btnClass = "border-red-500 bg-red-50 text-red-900";
                      iconClass = "bg-red-500 text-white";
                    } else {
                      // Other answers fade out
                      btnClass = "border-gray-100 bg-white text-gray-400 opacity-50 cursor-not-allowed";
                    }
                  }

                  return (
                    <button 
                      key={letter} 
                      onClick={() => handleOptionClick(letter)}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-300 text-left group ${btnClass}`}
                    >
                      <span className={`w-10 h-10 flex-shrink-0 font-bold rounded-full flex items-center justify-center transition-colors ${iconClass}`}>
                        {letter}
                      </span>
                      <span className="font-medium text-lg">{optionText}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-between items-center mt-10 pt-6 border-t border-gray-100">
              <button 
                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 disabled:opacity-30 transition transform active:scale-95"
              >
                Previous
              </button>
              <button 
                onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                disabled={currentIndex === questions.length - 1}
                className="px-6 py-3 bg-violet-600 text-white rounded-xl font-bold hover:bg-violet-700 transition shadow-md shadow-violet-200 flex items-center gap-2 transform active:scale-95"
              >
                Next <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Scrolling Navigator */}
        <div className="w-full xl:w-80 flex flex-col gap-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col h-[600px]">
            <h3 className="font-bold text-gray-900 mb-4">Question Navigator</h3>
            
            {/* Scrollable Container for all 150 questions */}
            <div className="grid grid-cols-5 gap-2 overflow-y-auto pr-2 custom-scrollbar flex-1 pb-4">
              {questions.map((q, i) => {
                // Determine color of circle in navigator
                const isAnswered = !!userAnswers[i];
                const isCorrect = userAnswers[i] === (q.final_key || q.correct_option);
                
                let navClass = "bg-gray-50 text-gray-500 hover:bg-gray-200 border-transparent";
                if (isAnswered) {
                  navClass = isCorrect ? "bg-emerald-500 text-white shadow-sm" : "bg-red-500 text-white shadow-sm";
                }
                if (i === currentIndex) {
                  navClass = "bg-white text-violet-600 border-2 border-violet-500 shadow-md transform scale-110";
                }

                return (
                  <button 
                    key={q.id} 
                    onClick={() => setCurrentIndex(i)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200 border-2 ${navClass}`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </Layout>
  );
}