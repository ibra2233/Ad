
import React, { useState, useEffect } from 'react';
import { Order, OrderStatus, Language } from '../types';
import { fetchOrders, syncOrder, deleteOrder, isConfigReady } from '../store';
import { Search, Plus, Edit2, Trash2, X, Loader2, Save, KeyRound, ShieldCheck } from 'lucide-react';

interface Props { lang: Language; }

const AdminView: React.FC<Props> = ({ lang }) => {
  const isAr = lang === 'ar';
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingOrder, setEditingOrder] = useState<Partial<Order> | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const isAdminKeyReady = isConfigReady('admin');

  const loadData = async () => {
    setLoading(true);
    // نطلب البيانات بصلاحية الأدمن (Secret Key)
    const data = await fetchOrders('admin');
    setOrders(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, []);

  const handleSave = async () => {
    if (!editingOrder?.orderCode || !editingOrder?.customerName) {
      alert(isAr ? 'بيانات ناقصة' : 'Missing details');
      return;
    }
    setIsProcessing(true);
    try {
      const orderData = {
        ...editingOrder,
        id: editingOrder.id || Date.now().toString(),
        status: editingOrder.status || 'China_Store',
        updatedAt: Date.now(),
      } as Order;

      await syncOrder(orderData);
      setEditingOrder(null);
      await loadData();
    } catch (err) {
      alert('Error saving data');
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredOrders = orders.filter(o => 
    (o.orderCode || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (o.customerName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto pb-32">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900">{isAr ? 'لوحة تحكم المسؤول' : 'Admin Dashboard'}</h1>
          <p className="text-slate-400 text-xs mt-1 font-bold">{isAr ? 'إدارة الشحنات باستخدام المفتاح السري' : 'Manage shipments with Secret Key'}</p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${isAdminKeyReady ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
          <ShieldCheck className="w-4 h-4" />
          {isAdminKeyReady ? (isAr ? 'المفتاح السري نشط' : 'Secret Key Active') : (isAr ? 'المفتاح مفقود' : 'Secret Key Missing')}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder={isAr ? 'بحث بالكود أو الاسم...' : 'Search shipments...'} 
            className="w-full pr-14 pl-6 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 ring-blue-500/5 font-bold"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button onClick={() => setEditingOrder({ status: 'China_Store', orderCode: 'LY-', customerName: '', quantity: 1, totalPrice: 0 })} className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
          <Plus className="w-5 h-5" /> {isAr ? 'إضافة شحنة' : 'New'}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-20"><Loader2 className="w-10 h-10 text-blue-500 animate-spin" /></div>
      ) : (
        <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-right">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-5 text-slate-400 text-xs font-black uppercase tracking-widest">{isAr ? 'الكود' : 'ID'}</th>
                <th className="px-6 py-5 text-slate-400 text-xs font-black uppercase tracking-widest">{isAr ? 'الزبون' : 'Customer'}</th>
                <th className="px-6 py-5 text-slate-400 text-xs font-black uppercase tracking-widest text-left">{isAr ? 'إجراء' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-6 font-mono font-black text-blue-600">{order.orderCode}</td>
                  <td className="px-6 py-6 font-bold text-slate-700">{order.customerName}</td>
                  <td className="px-6 py-6 text-left flex gap-2 justify-end">
                    <button onClick={() => setEditingOrder(order)} className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={async () => { if(confirm(isAr ? 'حذف الشحنة نهائياً؟' : 'Delete?')) { await deleteOrder(order.id); loadData(); } }} className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editingOrder && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-[2.5rem] w-full max-w-xl p-8 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button onClick={() => setEditingOrder(null)} className="absolute top-6 left-6 p-2 text-slate-300 hover:text-slate-900"><X className="w-6 h-6" /></button>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-black text-slate-900">{isAr ? 'تعديل بيانات الشحنة' : 'Edit Shipment'}</h2>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase mr-2">{isAr ? 'كود التتبع' : 'Tracking Code'}</label>
                  <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-mono font-black text-blue-600 outline-none focus:border-blue-500" placeholder="LY-000" value={editingOrder.orderCode || ''} onChange={e => setEditingOrder({...editingOrder, orderCode: e.target.value.toUpperCase()})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase mr-2">{isAr ? 'اسم الزبون' : 'Customer Name'}</label>
                  <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-blue-500" placeholder={isAr ? 'الاسم بالكامل' : 'Full Name'} value={editingOrder.customerName || ''} onChange={e => setEditingOrder({...editingOrder, customerName: e.target.value})} />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase mr-2">{isAr ? 'السعر (دينار)' : 'Price (LYD)'}</label>
                  <input type="number" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-black text-emerald-600" placeholder="0.00" value={editingOrder.totalPrice || 0} onChange={e => setEditingOrder({...editingOrder, totalPrice: parseFloat(e.target.value)})} />
                 </div>
                 <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase mr-2">{isAr ? 'حالة الشحنة' : 'Status'}</label>
                  <select className="w-full p-4 bg-slate-900 text-white rounded-xl font-bold outline-none" value={editingOrder.status} onChange={e => setEditingOrder({...editingOrder, status: e.target.value as OrderStatus})}>
                    <option value="China_Store">{isAr ? 'في مخزن الصين' : 'In China'}</option>
                    <option value="En_Route">{isAr ? 'في الطريق' : 'En Route'}</option>
                    <option value="Libya_Warehouse">{isAr ? 'وصلت ليبيا' : 'In Libya'}</option>
                    <option value="Delivered">{isAr ? 'تم التسليم' : 'Delivered'}</option>
                  </select>
                 </div>
              </div>

              <button onClick={handleSave} disabled={isProcessing} className="w-full py-4 mt-4 bg-blue-600 text-white rounded-xl font-black shadow-lg shadow-blue-100 flex items-center justify-center gap-2 active:scale-95 transition-all">
                {isProcessing ? <Loader2 className="animate-spin" /> : <Save className="w-5 h-5" />}
                {isAr ? 'تحديث البيانات بالمفتاح السري' : 'Update with Secret Key'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminView;
