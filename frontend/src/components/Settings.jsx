import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Settings, User, Phone, Mail, CheckCircle, ShieldAlert } from 'lucide-react';

export default function SettingsPage() {
  const [profile, setProfile] = useState({ full_name: '', username: '', phone: '', email: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (data) {
          setProfile({
            full_name: data.full_name || '',
            username: data.username || '',
            phone: data.phone || '',
            email: user.email || ''
          });
        }
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Check username uniqueness if modified
    const { data: taken } = await supabase.from('profiles').select('id').eq('username', profile.username).neq('id', user.id).maybeSingle();
    if (taken) {
      setMessage({ text: 'That username is already claimed by another account.', type: 'error' });
      setSaving(false);
      return;
    }

    const { error } = await supabase.from('profiles').update({
      full_name: profile.full_name,
      username: profile.username,
      phone: profile.phone
    }).eq('id', user.id);

    if (error) {
      setMessage({ text: error.message, type: 'error' });
    } else {
      setMessage({ text: 'Profile changes successfully synchronized!', type: 'success' });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-violet-100 p-3 rounded-2xl text-violet-600 shadow-sm"><Settings size={28} /></div>
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Account Configuration</h2>
          <p className="text-gray-500 font-medium text-sm">Manage your personal details and system credentials</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm">
        {message.text && (
          <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 font-medium animate-pulse
            ${message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-red-50 border-red-100 text-red-800'}`}
          >
            {message.type === 'success' ? <CheckCircle size={20} /> : <ShieldAlert size={20} />}
            <span className="text-sm">{message.text}</span>
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Full Name</label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-4 text-gray-400" />
                <input type="text" value={profile.full_name} onChange={e => setProfile({...profile, full_name: e.target.value})} className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition font-medium text-gray-900" required />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Unique Username</label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-4 text-gray-400" />
                <input type="text" value={profile.username} onChange={e => setProfile({...profile, username: e.target.value})} className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition font-medium text-gray-900" required />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Registered Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-4 text-gray-400" />
                <input type="email" value={profile.email} disabled className="w-full pl-12 pr-4 py-3.5 bg-gray-100 border border-gray-200 rounded-xl text-gray-400 font-medium outline-none cursor-not-allowed" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Phone Number</label>
              <div className="relative">
                <Phone size={18} className="absolute left-4 top-4 text-gray-400" />
                <input type="tel" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition font-medium text-gray-900" />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button type="submit" disabled={saving} className="px-6 py-3.5 bg-violet-600 text-white font-bold rounded-xl shadow-md hover:bg-violet-700 transition cursor-pointer disabled:opacity-70">
              {saving ? 'Synchronizing...' : 'Update Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}