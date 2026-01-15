
import React, { useState, useEffect } from 'react';
import { Language } from './types';
import { APP_TYPE } from './config';
import AdminView from './components/AdminView';
import UserView from './components/UserView';
import DriverView from './components/DriverView';
import { Box, Lock, Truck, Languages } from 'lucide-react';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('ar');
  const isAr = lang === 'ar';

  useEffect(() => {
    const savedLang = localStorage.getItem('app_lang');
    if (savedLang) setLang(savedLang as Language);
  }, []);

  const toggleLang = () => {
    const newLang = lang === 'ar' ? 'en' : 'ar';
    setLang(newLang);
    localStorage.setItem('app_lang', newLang);
  };

  // --- واجهة تطبيق الزبون (User APK) ---
  if (APP_TYPE === 'USER') {
    return (
      <div className={`min-h-screen bg-white flex flex-col ${isAr ? 'text-right' : 'text-left'}`} dir={isAr ? 'rtl' : 'ltr'}>
        <header className="bg-white px-8 py-6 flex justify-between items-center sticky top-0 z-50 border-b border-slate-50">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                <Box className="w-6 h-6" />
             </div>
             <span className="text-2xl font-black text-slate-900 tracking-tighter">LogiTrack</span>
          </div>
          <button onClick={toggleLang} className="text-blue-600 font-black text-sm px-4 py-2 bg-blue-50 rounded-lg">
            {isAr ? 'English' : 'العربية'}
          </button>
        </header>
        <main className="flex-1">
          <UserView lang={lang} />
        </main>
        <footer className="py-8 text-center bg-slate-50 border-t border-slate-100">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
            &copy; {new Date().getFullYear()} LogiTrack Customer App
          </p>
        </footer>
      </div>
    );
  }

  // --- واجهة تطبيق الإدارة (Admin APK) ---
  if (APP_TYPE === 'ADMIN') {
    return (
      <div className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col ${isAr ? 'text-right' : 'text-left'}`} dir={isAr ? 'rtl' : 'ltr'}>
        <header className="bg-slate-900 border-b border-slate-800 px-8 py-6 flex justify-between items-center sticky top-0 z-50">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                <Lock className="w-5 h-5" />
             </div>
             <div>
                <div className="font-black text-xl leading-none tracking-tighter text-white">LogiTrack Admin</div>
                <div className="text-[10px] text-blue-400 font-black uppercase mt-1">{isAr ? 'نظام الإدارة الشامل' : 'Master Control App'}</div>
             </div>
          </div>
          <button onClick={toggleLang} className="text-slate-400 font-bold text-xs hover:text-white transition-colors">
            {isAr ? 'English' : 'العربية'}
          </button>
        </header>
        <main className="flex-1 overflow-y-auto">
          <AdminView lang={lang} />
        </main>
      </div>
    );
  }

  // --- واجهة تطبيق المندوب (Driver APK) ---
  if (APP_TYPE === 'DRIVER') {
    return (
      <div className={`min-h-screen bg-blue-700 text-white flex flex-col ${isAr ? 'text-right' : 'text-left'}`} dir={isAr ? 'rtl' : 'ltr'}>
        <header className="p-6 flex justify-between items-center">
          <div className="font-black text-2xl flex items-center gap-3">
            <Truck className="w-6 h-6" />
            Driver App
          </div>
          <button onClick={toggleLang} className="bg-white/10 px-4 py-1.5 rounded-lg text-xs font-black">
            {isAr ? 'EN' : 'AR'}
          </button>
        </header>
        <main className="flex-1 bg-white text-slate-900 rounded-t-[3rem] mt-4 shadow-2xl overflow-y-auto">
          <DriverView lang={lang} />
        </main>
      </div>
    );
  }

  return null;
};

export default App;
