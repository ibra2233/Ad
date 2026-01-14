
import React, { useState, useEffect } from 'react';
import { Language } from './types';
import { APP_TYPE } from './config';
import AdminView from './components/AdminView';
import UserView from './components/UserView';
import DriverView from './components/DriverView';
import { Box, Lock, Truck, Globe } from 'lucide-react';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('ar');
  const isAr = lang === 'ar';

  useEffect(() => {
    const savedLang = localStorage.getItem('app_lang');
    if (savedLang) setLang(savedLang as Language);
    console.log("LOGITRACK_DEBUG: Current Mode is", APP_TYPE);
  }, []);

  const toggleLang = () => {
    const newLang = lang === 'ar' ? 'en' : 'ar';
    setLang(newLang);
    localStorage.setItem('app_lang', newLang);
  };

  const VersionIndicator = ({ mode }: { mode: string }) => (
    <div className="fixed bottom-4 right-4 z-[9999] opacity-30 pointer-events-none">
      <span className="text-[10px] font-black bg-slate-800 text-white px-3 py-1 rounded-full shadow-lg">
        MODE: {mode}
      </span>
    </div>
  );

  if (APP_TYPE === 'USER') {
    return (
      <div className={`min-h-screen bg-white flex flex-col ${isAr ? 'text-right' : 'text-left'}`} dir={isAr ? 'rtl' : 'ltr'}>
        <VersionIndicator mode="USER" />
        <header className="bg-white px-6 py-4 flex justify-between items-center border-b border-slate-100 sticky top-0 z-50">
          <div className="flex items-center gap-2">
             <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-md">
                <Box className="w-5 h-5" />
             </div>
             <span className="text-xl font-black text-slate-900 tracking-tighter">LogiTrack</span>
          </div>
          <button onClick={toggleLang} className="flex items-center gap-2 text-blue-600 font-bold text-sm px-4 py-2 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
            <Globe className="w-4 h-4" />
            {isAr ? 'English' : 'Ø§Ù„Ø¹Ø±Ø¨ÙŠØ©'}
          </button>
        </header>
        <main className="flex-1">
          <UserView lang={lang} />
        </main>
      </div>
    );
  }

  if (APP_TYPE === 'ADMIN') {
    return (
      <div className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col ${isAr ? 'text-right' : 'text-left'}`} dir={isAr ? 'rtl' : 'ltr'}>
        <VersionIndicator mode="ADMIN" />
        <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
          <div className="flex items-center gap-2">
             <div className="w-9 h-9 bg-indigo-500 rounded-lg flex items-center justify-center text-white shadow-md">
                <Lock className="w-5 h-5" />
             </div>
             <span className="text-xl font-black text-white tracking-tighter">ADMIN PORTAL</span>
          </div>
          <button onClick={toggleLang} className="text-slate-400 font-bold text-sm px-4 py-2 bg-slate-800 rounded-xl hover:text-white transition-all border border-slate-700">
            {isAr ? 'EN' : 'AR'}
          </button>
        </header>
        <main className="flex-1 overflow-y-auto">
          <AdminView lang={lang} />
        </main>
      </div>
    );
  }

  if (APP_TYPE === 'DRIVER') {
    return (
      <div className={`min-h-screen bg-blue-600 flex flex-col ${isAr ? 'text-right' : 'text-left'}`} dir={isAr ? 'rtl' : 'ltr'}>
        <VersionIndicator mode="DRIVER" />
        <header className="p-6 flex justify-between items-center text-white">
          <div className="flex items-center gap-3">
            <Truck className="w-7 h-7" />
            <span className="font-black text-xl">DRIVER OPS</span>
          </div>
          <button onClick={toggleLang} className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-black">
            {isAr ? 'ENGLISH' : 'Ø§Ù„Ø¹Ø±Ø¨ÙŠØ©'}
          </button>
        </header>
        <main className="flex-1 bg-slate-50 rounded-t-[2.5rem] mt-2 shadow-inner overflow-y-auto">
          <DriverView lang={lang} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 font-bold">
      Configuration Error: Invalid APP_TYPE
    </div>
  );
};

export default App;
