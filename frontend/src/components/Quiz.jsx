import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export default function Quiz({ bankId, goBack }) {
  const [questions, setQuestions] = useState([]);

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

  return (
    <div className="max-w-4xl mx-auto mt-10 bg-white p-8 rounded-xl shadow-lg border border-gray-200">
      <button onClick={goBack} className="text-blue-600 mb-6 font-bold hover:underline">
        ← Back to Dashboard
      </button>
      
      <h2 className="text-2xl font-bold mb-4">Exam Questions</h2>
      
      {questions.length === 0 ? (
        <p className="animate-pulse text-gray-500">Loading questions from database...</p>
      ) : (
        <div className="space-y-8">
          {questions.map((q) => (
            <div key={q.id} className="p-6 bg-gray-50 border rounded-lg shadow-sm">
              <p className="font-bold text-lg mb-4 text-gray-800">
                <span className="text-blue-600 mr-2">{q.question_number}.</span> 
                {q.question_text}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 bg-white border rounded hover:bg-blue-50 cursor-pointer">A. {q.option_a}</div>
                <div className="p-3 bg-white border rounded hover:bg-blue-50 cursor-pointer">B. {q.option_b}</div>
                <div className="p-3 bg-white border rounded hover:bg-blue-50 cursor-pointer">C. {q.option_c}</div>
                <div className="p-3 bg-white border rounded hover:bg-blue-50 cursor-pointer">D. {q.option_d}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}