
import React, { useState, useEffect, useRef } from 'react';
import { Order, Language } from '../types';
// Fixed: Replaced non-existent 'saveOrders' with 'syncOrder'
import { getOrders, updateOrderLocation, syncOrder } from '../store';
// Added User icon to the imports from lucide-react
import { Truck, Navigation, PackageCheck, AlertCircle, Phone, MapPin, User } from 'lucide-react';

interface Props { lang: Language; }

const DriverView: React.FC<Props> = ({ lang }) => {
  const isAr = lang === 'ar';
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isDriving, setIsDriving] = useState(false);
  const driverPosRef = useRef({ lat: 24.7136, lng: 46.6753 });
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    const load = () => {
      const all = getOrders();
      setOrders(all.filter(o => o.status === 'Out_for_Delivery'));
    };
    load();
    window.addEventListener('storage', load);
    return () => window.removeEventListener('storage', load);
  }, []);

  const t = {
    title: isAr ? 'بوابة الموزع' : 'Distributor Portal',
    available: isAr ? 'الطلبات الجاهزة للتوصيل' : 'Ready for Delivery',
    none: isAr ? 'لا توجد شحنات معلقة حالياً' : 'No pending shipments',
    start: isAr ? 'بدء التوصيل' : 'Start Delivery',
    customer: isAr ? 'الزبون' : 'Customer',
    address: isAr ? 'عنوان التسليم' : 'Delivery Address',
    phone: isAr ? 'اتصال بالزبون' : 'Call Customer',
    complete: isAr ? 'تم التسليم بنجاح' : 'Delivery Completed',
    alert: isAr ? 'تذكير: موقعك يظهر حالياً للزبون مباشرة على الخريطة.' : 'Reminder: Your location is currently live for the customer.'
  };

  const startDelivery = (order: Order) => {
    setActiveOrder(order);
    if (!order.customerLocation) {
        const custLoc = { lat: 24.7136 + (Math.random() - 0.5) * 0.05, lng: 46.6753 + (Math.random() - 0.5) * 0.05 };
        updateOrderLocation(order.orderCode, 'customer', custLoc);
    }
    setIsDriving(true);
    intervalRef.current = window.setInterval(() => {
        const currentOrders = getOrders();
        const currentOrder = currentOrders.find(o => o.id === order.id);
        if (!currentOrder || !currentOrder.customerLocation) return;
        const cust = currentOrder.customerLocation;
        const dLat = (cust.lat - driverPosRef.current.lat) * 0.05;
        const dLng = (cust.lng - driverPosRef.current.lng) * 0.05;
        driverPosRef.current = { lat: driverPosRef.current.lat + dLat, lng: driverPosRef.current.lng + dLng };
        updateOrderLocation(order.orderCode, 'driver', { ...driverPosRef.current });
        const dist = Math.sqrt(Math.pow(cust.lat - driverPosRef.current.lat, 2) + Math.pow(cust.lng - driverPosRef.current.lng, 2));
        if (dist < 0.001) { clearInterval(intervalRef.current!); setIsDriving(false); }
    }, 2000);
  };

  // Fixed: Updated to use 'syncOrder' and made the function async
  const completeDelivery = async () => {
    if (!activeOrder) return;
    const updatedOrder = { 
      ...activeOrder, 
      status: 'Delivered' as const, 
      updatedAt: Date.now() 
    };
    await syncOrder(updatedOrder);
    setActiveOrder(null);
    setIsDriving(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Truck className="w-8 h-8 text-blue-600" />
        <h1 className="text-3xl font-black text-slate-800">{t.title}</h1>
      </div>

      {!activeOrder ? (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-700">{t.available}</h2>
          {orders.length === 0 ? (
            <div className="bg-white border-2 border-dashed rounded-3xl p-16 text-center text-slate-400">
                <PackageCheck className="w-16 h-16 mx-auto mb-4 opacity-10" />
                <p className="font-bold">{t.none}</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {orders.map(o => (
                <div key={o.id} className="bg-white p-6 rounded-2xl border shadow-sm flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-mono text-blue-600 font-bold">{o.orderCode}</p>
                    <p className="text-lg font-black text-slate-800">{o.customerName}</p>
                    <div className="flex items-center gap-1 text-slate-500 text-xs font-bold">
                       <MapPin className="w-3 h-3" /> {o.customerAddress}
                    </div>
                  </div>
                  <button onClick={() => startDelivery(o)} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-black hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-100">
                    <Navigation className="w-4 h-4" /> {t.start}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-[40px] border-8 border-blue-50 p-8 shadow-2xl space-y-8">
          <div className="flex justify-between items-start">
             <div>
                <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-[10px] font-black uppercase tracking-wider mb-2 inline-block">{isDriving ? (isAr ? 'في الرحلة' : 'IN PROGRESS') : (isAr ? 'وصلت' : 'ARRIVED')}</span>
                <h2 className="text-4xl font-black text-slate-800">{activeOrder.orderCode}</h2>
                <div className="flex items-center gap-2 text-slate-500 font-bold mt-2">
                   <User className="w-4 h-4" /> {activeOrder.customerName}
                </div>
             </div>
             <a href={`tel:${activeOrder.customerPhone}`} className="p-4 bg-green-50 text-green-600 rounded-full hover:bg-green-100 transition-colors">
                <Phone className="w-8 h-8" />
             </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="p-6 bg-slate-50 rounded-3xl border">
                <p className="text-xs font-bold text-slate-400 mb-2 uppercase">{t.address}</p>
                <p className="font-black text-slate-800 text-xl">{activeOrder.customerAddress}</p>
             </div>
             <div className="p-6 bg-slate-50 rounded-3xl border">
                <p className="text-xs font-bold text-slate-400 mb-2 uppercase">{isAr ? 'المنتج' : 'Product'}</p>
                <p className="font-black text-slate-800 text-xl">{activeOrder.productName}</p>
             </div>
          </div>

          <button onClick={completeDelivery} className="w-full py-6 bg-green-600 text-white rounded-3xl font-black text-2xl hover:bg-green-700 transition-all shadow-xl shadow-green-100 flex items-center justify-center gap-3">
             <PackageCheck className="w-8 h-8" /> {t.complete}
          </button>
          
          <div className="bg-blue-50 p-4 rounded-2xl flex items-center gap-3 text-blue-700">
             <AlertCircle className="w-5 h-5 shrink-0" />
             <p className="text-xs font-bold">{t.alert}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverView;
