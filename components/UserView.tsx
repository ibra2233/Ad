
import React, { useState, useEffect } from 'react';
import { Order, Language, AppNotification } from '../types';
import { fetchOrders, fetchNotifications } from '../store';
import { Search, Loader2, Package, MapPin, Bell, X, CheckCircle2 } from 'lucide-react';
import TrackingMap from './TrackingMap';

interface Props { lang: Language; }

const UserView: React.FC<Props> = ({ lang }) => {
  const isAr = lang === 'ar';
  const [searchCode, setSearchCode] = useState('');
  const [foundOrder, setFoundOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);

  // Added async/await to correctly handle the Promise returned by fetchNotifications
  const loadNotifs = async () => {
    const data = await fetchNotifications();
    setNotifications(data);
  };

  useEffect(() => {
    loadNotifs();
    window.addEventListener('storage', loadNotifs);
    return () => window.removeEventListener('storage', loadNotifs);
  }, []);

  const handleSearch = async () => {
    if (!searchCode) return;
    setLoading(true);
    setError('');
    const orders = await fetchOrders();
    const order = orders.find(o => o.orderCode.trim().toUpperCase() === searchCode.trim().toUpperCase());
    if (order) setFoundOrder(order);
    else { setFoundOrder(null); setError(isAr ? 'لم يتم العثور على الكود' : 'Not found'); }
    setLoading(false);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="p-6 max-w-4xl mx-auto pb-24 relative">
      <div className="flex justify-end mb-6">
        <button 
          onClick={() => setShowNotifs(!showNotifs)}
          className="relative p-3 bg-white rounded-2xl shadow-sm border hover:bg-slate-50 transition-colors"
        >
          <Bell className="w-6 h-6 text-slate-600" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {showNotifs && (
        <div className="absolute top-20 right-6 left-6 z-[2000] bg-white rounded-3xl shadow-2xl border p-6 animate-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-black text-xl">{isAr ? 'الإشعارات' : 'Notifications'}</h3>
            <button onClick={() => setShowNotifs(false)}><X className="w-5 h-5 text-slate-400" /></button>
          </div>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-center py-10 text-slate-400">{isAr ? 'لا توجد تنبيهات جديدة' : 'No notifications'}</p>
            ) : (
              notifications.map(n => (
                <div key={n.id} className="p-4 bg-slate-50 rounded-2xl border-l-4 border-l-blue-500">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-black text-blue-600">{n.orderCode}</span>
                    <span className="text-[10px] text-slate-400">{new Date(n.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-sm font-bold text-slate-700">{n.body}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <div className="text-center mb-10">
        <h1 className="text-4xl font-black text-slate-900 mb-2">{isAr ? 'تتبع شحنتك' : 'Track Order'}</h1>
        <p className="text-slate-500">{isAr ? 'أدخل الكود لمتابعة حالة الطرد فوراً' : 'Enter code to track'}</p>
      </div>

      <div className="bg-white p-2 rounded-[2rem] shadow-xl border mb-10 flex flex-col md:flex-row gap-2">
        <input
          className="flex-1 px-8 py-4 bg-transparent outline-none text-xl font-black"
          placeholder="LY-XXXX"
          value={searchCode}
          onChange={(e) => setSearchCode(e.target.value)}
        />
        <button onClick={handleSearch} disabled={loading} className="bg-blue-600 text-white px-10 py-4 rounded-[1.5rem] font-black flex items-center justify-center">
          {loading ? <Loader2 className="animate-spin" /> : (isAr ? 'تتبع' : 'Track')}
        </button>
      </div>

      {foundOrder && (
        <div className="bg-white rounded-[2.5rem] border shadow-xl p-8 space-y-8 animate-in fade-in duration-500">
           <div className="flex justify-between items-center border-b pb-6">
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase">{isAr ? 'كود الشحنة' : 'Order Code'}</p>
                <h2 className="text-3xl font-black text-blue-600">{foundOrder.orderCode}</h2>
              </div>
              <div className="text-right">
                <p className="text-slate-400 text-xs font-bold uppercase">{isAr ? 'آخر تحديث' : 'Last update'}</p>
                <p className="font-bold">{new Date(foundOrder.updatedAt).toLocaleDateString()}</p>
              </div>
           </div>

           <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-blue-600 font-black text-xl mb-1">{foundOrder.currentPhysicalLocation || (isAr ? 'قيد المعالجة' : 'Processing')}</p>
                <p className="text-blue-400 text-sm font-bold">{isAr ? 'حالة الشحنة الحالية' : 'Current stage'}</p>
              </div>
           </div>

           {foundOrder.status === 'Out_for_Delivery' && (
             <div className="space-y-4">
                <div className="flex items-center gap-2 text-green-600 font-black animate-pulse">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  {isAr ? 'المندوب في الطريق إليك الآن' : 'Driver is on the way'}
                </div>
                <div className="h-[300px] rounded-2xl overflow-hidden border shadow-inner">
                   <TrackingMap driverLoc={foundOrder.driverLocation} customerLoc={foundOrder.customerLocation} isSimulating={true} />
                </div>
             </div>
           )}
        </div>
      )}
    </div>
  );
};

export default UserView;
