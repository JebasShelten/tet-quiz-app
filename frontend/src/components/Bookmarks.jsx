import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Trash2, Bookmark, HelpCircle } from 'lucide-react';

export default function Bookmarks() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookmarks = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('bookmarks')
        .select(`
          id,
          question_id,
          questions (
            id,
            question_text,
            option_a,
            option_b,
            option_c,
            option_d,
            correct_option,
            final_key
          )
        `)
        .eq('user_id', user.id);
      if (data) setBookmarks(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const handleRemoveBookmark = async (id) => {
    const { error } = await supabase.from('bookmarks').delete().eq('id', id);
    if (!error) {
      setBookmarks(prev => prev.filter(b => b.id !== id));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-orange-100 p-3 rounded-2xl text-orange-600 shadow-sm"><Bookmark size={28} fill="currentColor" /></div>
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Your Bookmarked Questions</h2>
          <p className="text-gray-500 font-medium text-sm">Review difficult items you saved during practice sessions</p>
        </div>
      </div>

      {bookmarks.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm flex flex-col items-center">
          <HelpCircle size={48} className="text-gray-300 mb-4" />
          <h3 className="text-xl font-bold text-gray-700 mb-1">No bookmarks yet</h3>
          <p className="text-gray-400 text-sm">Flag challenging questions during a quiz to see them here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {bookmarks.map((b) => {
            const q = b.questions;
            const correctLetter = q.final_key || q.correct_option;

            return (
              <div key={b.id} className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm relative group transition-all duration-300 hover:shadow-md">
                <button 
                  onClick={() => handleRemoveBookmark(b.id)}
                  className="absolute top-6 right-6 p-2.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition cursor-pointer"
                  title="Remove Bookmark"
                >
                  <Trash2 size={20} />
                </button>

                <h4 className="text-lg font-bold text-gray-900 pr-12 mb-6 leading-relaxed">{q.question_text}</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-4xl">
                  {['A', 'B', 'C', 'D'].map((letter) => {
                    const optionText = q[`option_${letter.toLowerCase()}`];
                    if (!optionText || optionText === 'EMPTY') return null;

                    const isCorrect = letter === correctLetter;

                    return (
                      <div 
                        key={letter} 
                        className={`p-4 rounded-xl border flex items-center gap-3 font-medium
                          ${isCorrect ? 'border-emerald-200 bg-emerald-50/50 text-emerald-900' : 'border-gray-100 bg-gray-50/30 text-gray-600'}`}
                      >
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-sm
                          ${isCorrect ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-500'}`}>{letter}</span>
                        <span>{optionText}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}