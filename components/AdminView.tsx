
import React, { useState, useEffect } from 'react';
import { Order, OrderStatus, Language } from '../types';
import { fetchOrders, syncOrder, deleteOrder } from '../store';
import { Search, Plus, Edit2, Trash2, X, Package, Loader2, Save } from 'lucide-react';

interface Props { lang: Language; }

const AdminView: React.FC<Props> = ({ lang }) => {
  const isAr = lang === 'ar';
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingOrder, setEditingOrder] = useState<Partial<Order> | null>(null);

  const loadData = async () => {
    setLoading(true);
    const data = await fetchOrders();
    setOrders(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, []);

  const handleSave = async () => {
    if (!editingOrder?.orderCode || !editingOrder?.customerName) return;
    
    const orderData = {
      ...editingOrder,
      id: editingOrder.id || Date.now().toString(),
      updatedAt: Date.now(),
      currentPhysicalLocation: editingOrder.currentPhysicalLocation || statusLabels[editingOrder.status as OrderStatus],
    } as Order;

    await syncOrder(orderData);
    setEditingOrder(null);
    loadData();
  };

  const statusLabels: Record<OrderStatus, string> = {
    'China_Store': isAr ? 'بانتظار الشحن' : 'Pending',
    'China_Warehouse': isAr ? 'في مخزن الصين' : 'Warehouse CN',
    'En_Route': isAr ? 'في الشحن الدولي' : 'En Route',
    'Libya_Warehouse': isAr ? 'وصلت ليبيا' : 'Warehouse LY',
    'Out_for_Delivery': isAr ? 'خرجت للتوصيل' : 'Out for Delivery',
    'Delivered': isAr ? 'تم التسليم' : 'Delivered'
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto pb-32">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-10">
        <div className="relative w-full md:w-96">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
          <input 
            type="text" 
            placeholder={isAr ? 'بحث بالكود أو اسم الزبون...' : 'Search...'} 
            className="w-full pr-12 pl-4 py-4 bg-slate-800 border border-slate-700 rounded-2xl text-white outline-none focus:ring-2 ring-blue-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={() => setEditingOrder({ status: 'China_Store', orderCode: 'LY-', customerName: '', productName: '', quantity: 1 })}
          className="w-full md:w-auto px-10 py-4 bg-blue-600 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-900/20"
        >
          <Plus className="w-6 h-6" /> {isAr ? 'إضافة شحنة جديدة' : 'Add Shipment'}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-20"><Loader2 className="w-10 h-10 text-blue-500 animate-spin" /></div>
      ) : (
        <div className="bg-slate-900/50 backdrop-blur-md rounded-[2.5rem] border border-slate-800 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-800 text-slate-400 uppercase text-[10px] font-black tracking-widest">
                  <th className="px-8 py-5">{isAr ? 'كود الشحنة' : 'Code'}</th>
                  <th className="px-8 py-5">{isAr ? 'الزبون' : 'Customer'}</th>
                  <th className="px-8 py-5">{isAr ? 'الحالة الحالية' : 'Status'}</th>
                  <th className="px-8 py-5 text-left">{isAr ? 'إدارة' : 'Manage'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {orders.filter(o => 
                  o.orderCode.toLowerCase().includes(searchTerm.toLowerCase()) || 
                  o.customerName.toLowerCase().includes(searchTerm.toLowerCase())
                ).map(order => (
                  <tr key={order.id} className="hover:bg-blue-500/5 transition-colors group">
                    <td className="px-8 py-6 font-mono font-black text-blue-400">{order.orderCode}</td>
                    <td className="px-8 py-6">
                      <div className="text-white font-bold">{order.customerName}</div>
                      <div className="text-[10px] text-slate-500">{order.productName}</div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`text-[10px] font-black px-4 py-1.5 rounded-full ${
                        order.status === 'Delivered' ? 'bg-green-500/10 text-green-400' :
                        order.status === 'Out_for_Delivery' ? 'bg-orange-500/10 text-orange-400' :
                        'bg-blue-500/10 text-blue-400'
                      }`}>
                        {statusLabels[order.status]}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-left space-x-2 space-x-reverse">
                      <button onClick={() => setEditingOrder(order)} className="p-3 bg-slate-800 text-blue-400 rounded-xl hover:bg-blue-500 hover:text-white transition-all"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={async () => { if(confirm(isAr ? 'هل أنت متأكد من حذف الشحنة؟' : 'Delete?')) { await deleteOrder(order.id); loadData(); } }} className="p-3 bg-slate-800 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {editingOrder && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 z-[9999] overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-[3rem] w-full max-w-2xl p-10 shadow-2xl my-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-white">{isAr ? 'تعديل بيانات الشحنة' : 'Edit Order'}</h2>
              <button onClick={() => setEditingOrder(null)} className="p-2 text-slate-500 hover:text-white"><X className="w-6 h-6" /></button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase">{isAr ? 'كود الشحنة' : 'Order Code'}</label>
                <input className="w-full p-4 bg-slate-950 rounded-2xl text-white outline-none border border-slate-800 focus:border-blue-500" value={editingOrder.orderCode} onChange={e => setEditingOrder({...editingOrder, orderCode: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase">{isAr ? 'اسم الزبون' : 'Customer Name'}</label>
                <input className="w-full p-4 bg-slate-950 rounded-2xl text-white outline-none border border-slate-800 focus:border-blue-500" value={editingOrder.customerName} onChange={e => setEditingOrder({...editingOrder, customerName: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase">{isAr ? 'حالة الشحن' : 'Shipping Status'}</label>
                <select className="w-full p-4 bg-slate-950 rounded-2xl text-white outline-none border border-slate-800 focus:border-blue-500 appearance-none" value={editingOrder.status} onChange={e => setEditingOrder({...editingOrder, status: e.target.value as OrderStatus})}>
                  {Object.entries(statusLabels).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase">{isAr ? 'الموقع الفعلي (نص)' : 'Physical Location'}</label>
                <input className="w-full p-4 bg-slate-950 rounded-2xl text-white outline-none border border-slate-800 focus:border-blue-500" placeholder={isAr ? "مثال: ميناء الخمس" : "e.g. Tripoli Port"} value={editingOrder.currentPhysicalLocation || ''} onChange={e => setEditingOrder({...editingOrder, currentPhysicalLocation: e.target.value})} />
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={handleSave} className="flex-1 py-5 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                <Save className="w-5 h-5" /> {isAr ? 'حفظ التغييرات وتنبيه الزبون' : 'Save & Notify User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminView;
