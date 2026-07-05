import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import Layout from './Layout';
import { Clock, ArrowLeft, ArrowRight, Bookmark, CheckCircle, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti'; 

export default function Quiz({ bankId, onBack }) {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const [userAnswers, setUserAnswers] = useState({});
  const [shake, setShake] = useState(false);

  // State for tracking if the quiz is over and what the score is
  const [isFinished, setIsFinished] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();

      // 1. Fetch the Questions
      const { data: qData } = await supabase
        .from('questions')
        .select('*')
        .eq('question_bank_id', bankId)
        .order('question_number', { ascending: true });

      if (qData) setQuestions(qData);

      // 2. Load any saved progress!
      if (user) {
        const { data: savedProgress } = await supabase
          .from('quiz_results')
          .select('*')
          .eq('bank_id', bankId)
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (savedProgress) {
          setUserAnswers(savedProgress.answers || {});
          
          // If they already finished it, skip the quiz and show results!
          if (savedProgress.status === 'completed') {
            setFinalScore(savedProgress.score);
            setIsFinished(true);
          }
        }
      }
      setLoading(false);
    }
    fetchData();
  }, [bankId]);

  // Auto-Save Function
  const handleOptionClick = async (letter) => {
    const currentQ = questions[currentIndex];
    const trueAnswer = currentQ?.final_key || currentQ?.correct_option;
    const hasAnswered = !!userAnswers[currentIndex];

    if (hasAnswered) return; 
    
    // 1. Update the UI instantly
    const newAnswers = { ...userAnswers, [currentIndex]: letter };
    setUserAnswers(newAnswers);

    if (letter === trueAnswer) {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 }, colors: ['#8b5cf6', '#10b981'] });
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }

    // 2. Auto-save quietly in the background!
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('quiz_results').upsert({ 
        user_id: user.id, 
        bank_id: bankId, 
        answers: newAnswers,
        status: 'in_progress',
        score: 0,
        total_questions: questions.length 
      }, { onConflict: 'user_id, bank_id' });
    }
  };

  // Final Submission Function
  const handleSubmitQuiz = async () => {
    setIsSubmitting(true);
    
    let calculatedScore = 0;
    questions.forEach((q, index) => {
      const trueAnswer = q.final_key || q.correct_option;
      if (userAnswers[index] === trueAnswer) {
        calculatedScore += 1;
      }
    });

    setFinalScore(calculatedScore);

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // Upsert the final score and lock it as 'completed'
      await supabase.from('quiz_results').upsert({ 
        user_id: user.id, 
        bank_id: bankId, 
        answers: userAnswers,
        status: 'completed',
        score: calculatedScore, 
        total_questions: questions.length 
      }, { onConflict: 'user_id, bank_id' });
    }

    confetti({ particleCount: 150, spread: 100, origin: { y: 0.5 } });
    setIsSubmitting(false);
    setIsFinished(true);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-500 border-t-transparent"></div>
        </div>
      </Layout>
    );
  }

  // The Results Screen UI
  if (isFinished) {
    const percentage = Math.round((finalScore / questions.length) * 100);
    return (
      <Layout>
        <div className="max-w-3xl mx-auto mt-10">
          <div className="bg-white rounded-3xl p-10 border border-gray-100 shadow-xl text-center flex flex-col items-center">
            
            <div className="w-24 h-24 bg-violet-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
              <Trophy size={48} className="text-violet-600" />
            </div>
            
            <h2 className="text-4xl font-bold text-gray-900 mb-2">Quiz Completed!</h2>
            <p className="text-gray-500 font-medium mb-10">Great job putting in the work. Here are your results.</p>

            <div className="flex gap-8 mb-12 w-full justify-center">
              <div className="bg-gray-50 p-6 rounded-2xl w-40 border border-gray-100 shadow-sm">
                <span className="text-sm text-gray-500 font-bold block mb-1">Score</span>
                <span className="text-3xl font-bold text-violet-600">{finalScore} / {questions.length}</span>
              </div>
              <div className="bg-gray-50 p-6 rounded-2xl w-40 border border-gray-100 shadow-sm">
                <span className="text-sm text-gray-500 font-bold block mb-1">Accuracy</span>
                <span className="text-3xl font-bold text-emerald-500">{percentage}%</span>
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={onBack}
                className="px-8 py-4 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Existing Quiz UI
  const currentQ = questions[currentIndex];
  const trueAnswer = currentQ?.final_key || currentQ?.correct_option;
  const answeredOption = userAnswers[currentIndex];
  const hasAnswered = !!answeredOption;

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

              <div className="flex flex-col gap-3">
                {['A', 'B', 'C', 'D'].map((letter) => {
                  const optionText = currentQ[`option_${letter.toLowerCase()}`];
                  if (!optionText || optionText === 'EMPTY') return null;
                  
                  let btnClass = "border-gray-100 bg-white text-gray-700 hover:border-violet-300 hover:bg-violet-50 cursor-pointer";
                  let iconClass = "bg-gray-100 text-gray-600";

                  if (hasAnswered) {
                    if (letter === trueAnswer) {
                      btnClass = "border-emerald-500 bg-emerald-50 text-emerald-900 shadow-md scale-[1.02] transition-transform";
                      iconClass = "bg-emerald-500 text-white";
                    } else if (letter === answeredOption && letter !== trueAnswer) {
                      btnClass = "border-red-500 bg-red-50 text-red-900";
                      iconClass = "bg-red-500 text-white";
                    } else {
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
              
              {currentIndex === questions.length - 1 ? (
                <button 
                  onClick={handleSubmitQuiz}
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition shadow-md shadow-emerald-200 flex items-center gap-2 transform active:scale-95"
                >
                  {isSubmitting ? 'Saving...' : 'Submit Quiz'} <CheckCircle size={20} />
                </button>
              ) : (
                <button 
                  onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                  className="px-6 py-3 bg-violet-600 text-white rounded-xl font-bold hover:bg-violet-700 transition shadow-md shadow-violet-200 flex items-center gap-2 transform active:scale-95"
                >
                  Next <ArrowRight size={20} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Scrolling Navigator */}
        <div className="w-full xl:w-80 flex flex-col gap-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col h-[600px]">
            <h3 className="font-bold text-gray-900 mb-4">Question Navigator</h3>
            
            <div className="grid grid-cols-5 gap-2 overflow-y-auto pr-2 custom-scrollbar flex-1 pb-4">
              {questions.map((q, i) => {
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