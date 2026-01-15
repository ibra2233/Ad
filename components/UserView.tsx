
import React, { useState } from 'react';
import { Order, Language } from '../types';
import { fetchOrders, isConfigReady } from '../store';
import { Search, Loader2, Package, Clock, ShieldCheck, CreditCard, User, Info } from 'lucide-react';

interface Props { lang: Language; }

const UserView: React.FC<Props> = ({ lang }) => {
  const isAr = lang === 'ar';
  const [searchCode, setSearchCode] = useState('');
  const [foundOrder, setFoundOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isPublicReady = isConfigReady('user');

  const handleSearch = async () => {
    const code = searchCode.trim().toUpperCase();
    if (!code) return;
    setLoading(true);
    setError('');
    
    // نطلب البيانات بصلاحية الزبون (Publishable Key)
    const orders = await fetchOrders('user');
    const order = orders.find(o => o.orderCode.trim().toUpperCase() === code);
    
    if (order) setFoundOrder(order);
    else {
      setFoundOrder(null);
      setError(isAr ? 'رقم الشحنة غير صحيح أو غير موجود حالياً' : 'Shipment code not found');
    }
    setLoading(false);
  };

  const statusLabels: Record<string, string> = {
    'China_Store': isAr ? 'في مخزن الصين' : 'In China',
    'China_Warehouse': isAr ? 'في مخزن الصين' : 'In China',
    'En_Route': isAr ? 'في الشحن الدولي' : 'En Route',
    'Libya_Warehouse': isAr ? 'وصلت ليبيا' : 'In Libya',
    'Out_for_Delivery': isAr ? 'مع المندوب' : 'Out for Delivery',
    'Delivered': isAr ? 'تم التسليم' : 'Delivered'
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-12 pb-32">
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-blue-600 text-white rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-100">
          <Package className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">{isAr ? 'تتبع شحنتك' : 'Track Your Shipment'}</h1>
        <p className="text-slate-400 text-sm mt-1 font-bold">{isAr ? 'أدخل كود التتبع الذي يبدأ بـ LY' : 'Enter your LY tracking code'}</p>
      </div>

      <div className="bg-white p-2 rounded-2xl border border-slate-200 flex gap-2 mb-8 shadow-sm focus-within:ring-4 ring-blue-500/5 transition-all">
        <input
          className="flex-1 px-4 py-3 bg-transparent outline-none text-xl font-black uppercase text-slate-800 placeholder:text-slate-200"
          placeholder="LY-XXXX"
          value={searchCode}
          onChange={(e) => setSearchCode(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-xl font-black flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-100">
          {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Search className="w-5 h-5" />}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-500 rounded-2xl text-center font-bold mb-8 border border-red-100 animate-in fade-in duration-300">
          {error}
        </div>
      )}

      {!foundOrder && !error && !loading && (
        <div className="bg-blue-50/50 p-6 rounded-[2rem] border border-blue-100/50 flex items-start gap-4">
          <Info className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
          <p className="text-sm font-bold text-blue-700 leading-relaxed">
            {isAr 
              ? 'نظام التتبع لدينا يمنحك وصولاً مباشراً إلى حالة شحناتك القادمة من الصين إلى ليبيا لحظة بلحظة.' 
              : 'Our tracking system gives you real-time access to your shipment status from China to Libya.'}
          </p>
        </div>
      )}

      {foundOrder && (
        <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-xl shadow-slate-200/50 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
            <div>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">{isAr ? 'رقم التتبع' : 'Tracking ID'}</p>
              <h2 className="text-2xl font-black text-blue-400">{foundOrder.orderCode}</h2>
            </div>
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/10">
              <Package className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="flex items-center gap-4 bg-blue-50 p-5 rounded-[1.5rem] border border-blue-100">
               <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-blue-600">
                  <Clock className="w-5 h-5" />
               </div>
               <div>
                  <p className="text-blue-600/60 text-[10px] font-black uppercase tracking-widest mb-1">{isAr ? 'الحالة الحالية' : 'Current Status'}</p>
                  <p className="font-black text-blue-900 text-lg">{statusLabels[foundOrder.status]}</p>
               </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
               <div className="space-y-1">
                  <div className="flex items-center gap-2 text-slate-400">
                    <User className="w-3 h-3" />
                    <p className="text-[10px] font-black uppercase">{isAr ? 'المستلم' : 'Receiver'}</p>
                  </div>
                  <p className="font-bold text-slate-800">{foundOrder.customerName}</p>
               </div>
               <div className="text-left space-y-1">
                  <div className="flex items-center gap-2 text-slate-400 justify-end">
                    <p className="text-[10px] font-black uppercase">{isAr ? 'الإجمالي' : 'Total'}</p>
                    <CreditCard className="w-3 h-3" />
                  </div>
                  <p className="font-black text-emerald-600 text-lg">{foundOrder.totalPrice} LYD</p>
               </div>
            </div>
          </div>
          
          <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
             <p className={`text-[10px] font-black uppercase tracking-tighter flex items-center justify-center gap-2 ${isPublicReady ? 'text-blue-500' : 'text-slate-400'}`}>
                <ShieldCheck className="w-3 h-3" /> 
                {isPublicReady ? (isAr ? 'اتصال عام آمن (نشط)' : 'Public Secure Link Active') : (isAr ? 'غير متصل' : 'Offline')}
             </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserView;
