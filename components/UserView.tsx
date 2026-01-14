
import React, { useState, useEffect } from 'react';
import { Order, Language, AppNotification } from '../types';
import { fetchOrders, fetchNotifications } from '../store';
import { Search, Loader2, Package, MapPin, Bell, X, CheckCircle2, ShoppingBag, Hash, CreditCard, User, Phone } from 'lucide-react';
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
    else { 
      setFoundOrder(null); 
      setError(isAr ? 'عذراً، كود الشحنة غير موجود في سجلاتنا' : 'Shipment code not found'); 
    }
    setLoading(false);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="p-6 max-w-4xl mx-auto pb-24 relative">
      {/* التنبيهات */}
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

      {/* حقل البحث */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">{isAr ? 'تتبع شحنتك' : 'Track Order'}</h1>
        <p className="text-slate-500 font-medium">{isAr ? 'أدخل كود التتبع لمعرفة تفاصيل طردك وموقعه الحالي' : 'Check your package details and location'}</p>
      </div>

      <div className="bg-white p-2 rounded-[2.5rem] shadow-2xl shadow-blue-900/5 border mb-6 flex flex-col md:flex-row gap-2 transition-all focus-within:ring-2 ring-blue-500/20">
        <input
          className="flex-1 px-8 py-5 bg-transparent outline-none text-2xl font-black placeholder:text-slate-200"
          placeholder="LY-XXXX"
          value={searchCode}
          onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button onClick={handleSearch} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-5 rounded-[2rem] font-black flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-500/30">
          {loading ? <Loader2 className="animate-spin" /> : (isAr ? 'تتبع الآن' : 'Track Now')}
        </button>
      </div>

      {error && <p className="text-red-500 text-center font-bold mb-6 animate-pulse">{error}</p>}

      {/* عرض البيانات المفصلة */}
      {foundOrder && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-500">
          
          {/* كرت الحالة الرئيسي */}
          <div className="bg-white rounded-[2.5rem] border shadow-xl p-8 space-y-8 overflow-hidden relative">
            <div className="absolute top-0 right-0 left-0 h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
            
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-50 pb-6">
                <div>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{isAr ? 'كود الشحنة' : 'Tracking Code'}</p>
                  <h2 className="text-4xl font-black text-blue-600 tracking-tighter">{foundOrder.orderCode}</h2>
                </div>
                <div className="md:text-left">
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{isAr ? 'آخر تحديث' : 'Last update'}</p>
                  <p className="font-bold text-slate-700">{new Date(foundOrder.updatedAt).toLocaleString()}</p>
                </div>
             </div>

             {/* الحالة الحالية */}
             <div className="bg-blue-50 p-8 rounded-3xl border border-blue-100 flex items-center gap-6">
                <div className="p-4 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-500/30">
                  <Package className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-blue-900 font-black text-2xl mb-1 leading-none">{foundOrder.currentPhysicalLocation || (isAr ? 'قيد المعالجة' : 'Processing')}</p>
                  <p className="text-blue-600/60 text-sm font-bold">{isAr ? 'المرحلة الحالية للطرد' : 'Current shipment stage'}</p>
                </div>
             </div>

             {/* شبكة المعلومات: ما له وما عليه */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* معلومات السلعة */}
                <div className="bg-slate-50 p-6 rounded-3xl space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2">{isAr ? 'تفاصيل السلعة' : 'Item Details'}</h4>
                  <div className="flex items-center gap-3">
                    <ShoppingBag className="w-5 h-5 text-slate-400" />
                    <span className="font-bold text-slate-800">{foundOrder.productName}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Hash className="w-5 h-5 text-slate-400" />
                    <span className="font-bold text-slate-800">{isAr ? `الكمية: ${foundOrder.quantity}` : `Qty: ${foundOrder.quantity}`}</span>
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <div className="p-2 bg-green-500/10 rounded-lg">
                      <CreditCard className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <span className="block text-[10px] font-black text-green-600/50 uppercase">{isAr ? 'المبلغ المطلوب دفعه' : 'Total to Pay'}</span>
                      <span className="text-2xl font-black text-green-600">{foundOrder.totalPrice} LYD</span>
                    </div>
                  </div>
                </div>

                {/* معلومات الزبون والعنوان */}
                <div className="bg-slate-50 p-6 rounded-3xl space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2">{isAr ? 'بيانات المستلم' : 'Receiver Info'}</h4>
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-slate-400" />
                    <span className="font-bold text-slate-800">{foundOrder.customerName}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-slate-400" />
                    <span className="font-bold text-slate-800">{foundOrder.customerPhone}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-slate-400 mt-1" />
                    <span className="font-bold text-slate-800 leading-tight">{foundOrder.customerAddress}</span>
                  </div>
                </div>

             </div>

             {/* خريطة التتبع المباشر - تظهر فقط عند خروج الطلب للتوصيل */}
             {foundOrder.status === 'Out_for_Delivery' && (
               <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-3 text-green-600 font-black animate-pulse bg-green-50 p-4 rounded-2xl border border-green-100">
                    <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                    {isAr ? 'المندوب في طريقه إليك الآن - تتبع موقعه مباشرة' : 'Driver is heading to you - Track live'}
                  </div>
                  <div className="h-[350px] rounded-[2rem] overflow-hidden border-4 border-white shadow-2xl relative z-0">
                     <TrackingMap driverLoc={foundOrder.driverLocation} customerLoc={foundOrder.customerLocation} isSimulating={true} />
                  </div>
               </div>
             )}
          </div>

          <div className="text-center pb-10">
            <p className="text-slate-400 text-sm">{isAr ? 'شكراً لثقتكم بنا في لوجي تراك' : 'Thank you for choosing LogiTrack'}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserView;
