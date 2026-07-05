import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Mail, Lock, User, Phone, AlertCircle, ArrowRight } from 'lucide-react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        // --- LOGIN LOGIC ---
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw new Error(error.message === 'Invalid login credentials' ? 'Incorrect email or password.' : error.message);
      } else {
        // --- SIGNUP LOGIC ---
        // 1. Check if username is already taken
        const { data: existingUser } = await supabase.from('profiles').select('username').eq('username', username).single();
        if (existingUser) throw new Error('That username is already taken. Please choose another.');

        // 2. Create the Auth User
        const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
        if (authError) throw new Error(authError.message);

        // 3. Create their custom Profile
        if (authData.user) {
          const { error: profileError } = await supabase.from('profiles').insert([
            { id: authData.user.id, email, username, full_name: fullName, phone }
          ]);
          if (profileError) throw new Error('Account created, but failed to save profile details.');
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        
        {/* Header Banner */}
        <div className="bg-violet-600 p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-2">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <p className="text-violet-200 text-sm">
            {isLogin ? 'Enter your details to access your dashboard.' : 'Join the ultimate TET exam preparation platform.'}
          </p>
        </div>

        {/* Form Area */}
        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-start gap-3 border border-red-100 animate-pulse">
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <>
                <InputBox icon={<User />} type="text" placeholder="Full Name" value={fullName} onChange={setFullName} required />
                <InputBox icon={<User />} type="text" placeholder="Unique Username" value={username} onChange={setUsername} required />
                <InputBox icon={<Phone />} type="tel" placeholder="Phone Number (Optional)" value={phone} onChange={setPhone} />
              </>
            )}
            
            <InputBox icon={<Mail />} type="email" placeholder="Email Address" value={email} onChange={setEmail} required />
            <InputBox icon={<Lock />} type="password" placeholder="Password (min 6 characters)" value={password} onChange={setPassword} required minLength={6} />

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-violet-600 text-white font-bold py-4 rounded-xl mt-6 hover:bg-violet-700 transition shadow-md flex justify-center items-center gap-2 disabled:opacity-70"
            >
              {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
              {!loading && <ArrowRight size={20} />}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button onClick={() => { setIsLogin(!isLogin); setError(null); }} className="text-violet-600 font-bold hover:underline">
                {isLogin ? 'Sign up here' : 'Log in here'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper component for clean input fields
function InputBox({ icon, type, placeholder, value, onChange, required, minLength }) {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
        {icon}
      </div>
      <input
        type={type}
        required={required}
        minLength={minLength}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition text-gray-900 font-medium"
      />
    </div>
  );
}