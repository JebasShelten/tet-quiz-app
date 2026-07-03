import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export default function Quiz({ bankId, goBack }) {
  const [questions, setQuestions] = useState([]);
  // This will store what the user clicked: { questionId: 'A' }
  const [selectedAnswers, setSelectedAnswers] = useState({}); 

  useEffect(() => {
    async function fetchQuestions() {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('question_bank_id', bankId)
        .order('question_number', { ascending: true });
        
      if (data) setQuestions(data);
    }
    fetchQuestions();
  }, [bankId]);

  // Function to handle clicking an option
  const handleSelect = (questionId, selectedOption) => {
    // Only allow selecting if they haven't answered this question yet
    if (!selectedAnswers[questionId]) {
      setSelectedAnswers({
        ...selectedAnswers,
        [questionId]: selectedOption
      });
    }
  };

  // Function to determine the button color
  const getOptionStyle = (q, optionLetter) => {
    const userChoice = selectedAnswers[q.id];
    const isCorrectAnswer = q.correct_option === optionLetter;

    if (!userChoice) return "bg-white hover:bg-blue-50 cursor-pointer border-gray-200"; // Default
    
    if (isCorrectAnswer) return "bg-green-100 border-green-500 font-bold text-green-800"; // Always highlight correct answer if answered
    if (userChoice === optionLetter && !isCorrectAnswer) return "bg-red-100 border-red-500 text-red-800"; // Highlight wrong choice
    
    return "bg-gray-50 border-gray-100 opacity-50 cursor-not-allowed"; // Fade out others
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 bg-white p-8 rounded-xl shadow-lg border border-gray-200">
      <button onClick={goBack} className="text-blue-600 mb-6 font-bold hover:underline">
        ← Back to Dashboard
      </button>
      
      <h2 className="text-2xl font-bold mb-6 border-b pb-2">Exam Questions</h2>
      
      {questions.length === 0 ? (
        <p className="animate-pulse text-blue-500 font-medium text-center py-10">Loading questions from database...</p>
      ) : (
        <div className="space-y-8">
          {questions.map((q) => (
            <div key={q.id} className="p-6 bg-gray-50 border rounded-lg shadow-sm">
              <p className="font-bold text-lg mb-4 text-gray-800">
                <span className="text-blue-600 mr-2">{q.question_number}.</span> 
                {q.question_text}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button 
                  onClick={() => handleSelect(q.id, 'A')}
                  className={`p-3 text-left border rounded transition-all ${getOptionStyle(q, 'A')}`}
                >
                  A. {q.option_a}
                </button>
                <button 
                  onClick={() => handleSelect(q.id, 'B')}
                  className={`p-3 text-left border rounded transition-all ${getOptionStyle(q, 'B')}`}
                >
                  B. {q.option_b}
                </button>
                <button 
                  onClick={() => handleSelect(q.id, 'C')}
                  className={`p-3 text-left border rounded transition-all ${getOptionStyle(q, 'C')}`}
                >
                  C. {q.option_c}
                </button>
                <button 
                  onClick={() => handleSelect(q.id, 'D')}
                  className={`p-3 text-left border rounded transition-all ${getOptionStyle(q, 'D')}`}
                >
                  D. {q.option_d}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}