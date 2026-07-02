import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export default function Dashboard() {
  const [banks, setBanks] = useState([]);

  useEffect(() => {
    async function fetchBanks() {
      // Go to Supabase and grab everything from the question_banks table
      const { data, error } = await supabase.from('question_banks').select('*');
      if (data) {
        setBanks(data);
      }
    }
    fetchBanks();
  }, []);

  return (
    <div className="max-w-4xl mx-auto mt-10 bg-white p-8 rounded-xl shadow-lg border border-gray-200">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-4">
        Available TET Question Banks
      </h2>
      
      {banks.length === 0 ? (
        <div className="text-center py-10 bg-blue-50 rounded-lg border-2 border-dashed border-blue-200">
          <p className="text-blue-600 font-medium animate-pulse">
            Waiting for backend data... No question banks loaded yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {banks.map((bank) => (
            <button 
              key={bank.id} 
              className="p-5 text-left bg-gray-50 hover:bg-blue-50 hover:border-blue-300 border rounded-lg transition-all shadow-sm"
            >
              <h3 className="font-bold text-lg text-gray-800">{bank.title}</h3>
              <p className="text-sm text-gray-500">Date: {bank.exam_date} | Session: {bank.session}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}